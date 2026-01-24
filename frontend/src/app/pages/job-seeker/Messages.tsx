import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';
import { Send, Search, Loader2, Lock } from 'lucide-react';
import messageService, { type Conversation, type Message } from '@/services/messageService';
import authService from '@/services/authService';
import encryptionService from '@/services/encryptionService';
import { encryptMessage, decryptMessage, getPrivateKey } from '@/lib/encryption';
import { useEncryption } from '@/hooks/useEncryption';

export function JobSeekerMessages() {
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('user');
  const { isInitialized: encryptionReady } = useEncryption();
  
  const currentUser = authService.getStoredUser();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.user._id);
      const interval = setInterval(() => {
        fetchMessages(selectedConversation.user._id);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const convs = await messageService.getAllConversations();
      setConversations(convs);
      
      if (userId) {
        const conv = convs.find(c => c.user._id === userId);
        if (conv) {
          setSelectedConversation(conv);
        } else {
          // No existing conversation - fetch user details to start new conversation
          try {
            const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
              }
            });
            if (response.ok) {
              const userData = await response.json();
              // Create a temporary conversation object for the new conversation
              const tempConversation: Conversation = {
                user: {
                  _id: userData.data._id,
                  name: userData.data.name,
                  email: userData.data.email,
                  profilePicture: userData.data.profilePicture,
                  role: userData.data.role
                },
                lastMessage: null as any,
                unreadCount: 0
              };
              setSelectedConversation(tempConversation);
            }
          } catch (err) {
            console.error('Failed to fetch user details:', err);
          }
        }
      } else if (convs.length > 0 && !selectedConversation) {
        setSelectedConversation(convs[0]);
      }
    } catch (err: any) {
      console.error('Failed to fetch conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (userId: string) => {
    try {
      const msgs = await messageService.getConversation(userId);
      // Decrypt encrypted messages - ONLY if current user is the receiver
      const privateKey = getPrivateKey();
      const decryptedMsgs = await Promise.all(
        msgs.map(async (msg) => {
          // Check if current user is sender or receiver
          const isSender = msg.sender._id === currentUser?._id;
          const isReceiver = msg.receiver._id === currentUser?._id;
          
          // If encrypted message
          if (msg.encrypted === true && privateKey) {
            try {
              // If I'm the sender, decrypt encryptedForSender
              if (isSender && msg.encryptedForSender) {
                const decryptedContent = await decryptMessage(msg.encryptedForSender, privateKey);
                return { ...msg, content: decryptedContent };
              }
              // If I'm the receiver, decrypt encryptedForReceiver
              if (isReceiver && msg.encryptedForReceiver) {
                const decryptedContent = await decryptMessage(msg.encryptedForReceiver, privateKey);
                return { ...msg, content: decryptedContent };
              }
            } catch (error) {
              console.error('Decryption failed for message:', msg._id, error);
              return { ...msg, content: '[Unable to decrypt - key mismatch]' };
            }
          }
          // Return plain text messages as-is
          return msg;
        })
      );
      // Sort messages by creation date (oldest first)
      const sortedMsgs = decryptedMsgs.sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      setMessages(sortedMsgs);
      
      const unreadMessages = msgs.filter(
        msg => !msg.isRead && msg.receiver._id === currentUser?._id
      );
      for (const msg of unreadMessages) {
        await messageService.markAsRead(msg._id);
      }
    } catch (err: any) {
      // If 404, it means no conversation exists yet - that's OK, start with empty messages
      if (err.response?.status === 404) {
        setMessages([]);
      } else {
        console.error('Failed to fetch messages:', err);
      }
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || sending) return;

    try {
      setSending(true);
      const plaintextMessage = newMessage.trim();
      let encryptedForSender = '';
      let encryptedForReceiver = '';
      let isEncrypted = false;

      // Encrypt message if encryption is ready
      if (encryptionReady) {
        try {
          // Get both public keys
          const [recipientPublicKeyRes, senderPublicKeyRes] = await Promise.all([
            encryptionService.getPublicKey(selectedConversation.user._id),
            encryptionService.getPublicKey(currentUser?._id || ''),
          ]);
          
          const recipientPublicKey = recipientPublicKeyRes.data?.publicKey;
          const senderPublicKey = senderPublicKeyRes.data?.publicKey;
          
          console.log('Recipient public key retrieved:', !!recipientPublicKey);
          console.log('Sender public key retrieved:', !!senderPublicKey);
          
          if (recipientPublicKey && senderPublicKey) {
            // Encrypt for receiver (so they can decrypt)
            encryptedForReceiver = await encryptMessage(plaintextMessage, recipientPublicKey);
            // Encrypt for sender (so you can see your own message)
            encryptedForSender = await encryptMessage(plaintextMessage, senderPublicKey);
            isEncrypted = true;
            console.log('Message encrypted for both sender and receiver');
          }
        } catch (error) {
          console.warn('Failed to encrypt message, sending unencrypted:', error);
        }
      }

      // Send encrypted versions (no plaintext stored in DB)
      const contentToSend = isEncrypted ? '' : plaintextMessage; // Empty if encrypted
      await messageService.sendMessage(selectedConversation.user._id, contentToSend, isEncrypted, encryptedForSender, encryptedForReceiver);
      setNewMessage('');
      await fetchMessages(selectedConversation.user._id);
      await fetchConversations();
    } catch (err: any) {
      console.error('Failed to send message:', err);
      alert(`Failed to send message: ${err.response?.data?.message || err.message}`);
    } finally {
      setSending(false);
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl mb-2 text-gray-900">Messages</h1>
        <p className="text-gray-600">Communicate with employers</p>
      </div>

      <div className="grid lg:grid-cols-[320px_1fr] gap-6">
        <Card>
          <CardHeader>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input 
                placeholder="Search conversations..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {filteredConversations.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No conversations yet</p>
            ) : (
              filteredConversations.map((conv) => (
                <button
                  key={conv.user._id}
                  onClick={() => setSelectedConversation(conv)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedConversation?.user._id === conv.user._id
                      ? 'bg-blue-100'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Avatar>
                      {conv.user.profilePicture ? (
                        <img src={conv.user.profilePicture} alt={conv.user.name} />
                      ) : (
                        <AvatarFallback className="bg-purple-100 text-purple-600">
                          {conv.user.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold text-sm truncate">{conv.user.name}</p>
                        <span className="text-xs text-gray-500">
                          {new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">{conv.lastMessage.content}</p>
                    </div>
                    {conv.unreadCount > 0 && (
                      <div className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {conv.unreadCount}
                      </div>
                    )}
                  </div>
                </button>
              ))
            )}
          </CardContent>
        </Card>

        {selectedConversation ? (
          <Card className="flex flex-col h-[600px]">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    {selectedConversation.user.profilePicture ? (
                      <img src={selectedConversation.user.profilePicture} alt={selectedConversation.user.name} />
                    ) : (
                      <AvatarFallback className="bg-purple-100 text-purple-600">
                        {selectedConversation.user.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{selectedConversation.user.name}</CardTitle>
                    <p className="text-sm text-gray-500">{selectedConversation.user.email}</p>
                  </div>
                </div>
                {encryptionReady && (
                  <div className="flex items-center gap-1 text-xs text-green-600">
                    <Lock className="w-3 h-3" />
                    <span>Encrypted</span>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No messages yet. Start the conversation!</p>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg._id}
                    className={`flex ${msg.sender._id === currentUser?._id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        msg.sender._id === currentUser?._id
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          msg.sender._id === currentUser?._id ? 'text-blue-100' : 'text-gray-500'
                        }`}
                      >
                        {new Date(msg.createdAt).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </CardContent>
            <div className="border-t p-4">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  disabled={sending}
                />
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={sending}>
                  {sending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </form>
            </div>
          </Card>
        ) : (
          <Card className="flex items-center justify-center h-[600px]">
            <p className="text-gray-500">Select a conversation to start messaging</p>
          </Card>
        )}
      </div>
    </div>
  );
}
