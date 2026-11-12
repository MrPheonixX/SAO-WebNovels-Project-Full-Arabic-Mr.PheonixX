import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  MessageCircle, 
  Heart, 
  Share2, 
  Trophy, 
  BookOpen, 
  Quote,
  Send,
  Crown,
  Flame,
  Target,
  Calendar,
  Zap,
  Star,
  ThumbsUp,
  Eye,
  Clock
} from 'lucide-react';

interface User {
  id: string;
  username: string;
  avatar: string;
  level: number;
  badge?: string;
  isOnline: boolean;
}

interface ReadingClub {
  id: string;
  name: string;
  description: string;
  members: User[];
  currentBook: string;
  progress: number;
  nextMeeting: Date;
  isJoined: boolean;
}

interface Discussion {
  id: string;
  author: User;
  content: string;
  chapter: string;
  timestamp: Date;
  likes: number;
  replies: Reply[];
  hasLiked: boolean;
  spoilerLevel: 'none' | 'mild' | 'major';
}

interface Reply {
  id: string;
  author: User;
  content: string;
  timestamp: Date;
  likes: number;
  hasLiked: boolean;
}

interface Quote {
  id: string;
  text: string;
  author: User;
  chapter: string;
  series: string;
  likes: number;
  hasLiked: boolean;
  timestamp: Date;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'reading-speed' | 'pages' | 'streak' | 'discussion';
  target: number;
  participants: User[];
  endDate: Date;
  prize: string;
  isJoined: boolean;
  progress?: number;
}

const SocialReadingHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState('clubs');
  const [newComment, setNewComment] = useState('');
  const [selectedClub, setSelectedClub] = useState<string | null>(null);

  // Mock data
  const [readingClubs] = useState<ReadingClub[]>([
    {
      id: '1',
      name: 'نادي ساو العربي',
      description: 'مناقشة جميع أعمال ساو باللغة العربية',
      members: [
        { id: '1', username: 'كيريتو_العرب', avatar: '⚔️', level: 95, badge: 'Beta Tester', isOnline: true },
        { id: '2', username: 'أسونا_النور', avatar: '🌟', level: 87, badge: 'Speed Reader', isOnline: true },
        { id: '3', username: 'أليس_الفارسة', avatar: '🛡️', level: 76, badge: 'Completionist', isOnline: false }
      ],
      currentBook: 'SAO المجلد 16: Alicization Exploding',
      progress: 67,
      nextMeeting: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      isJoined: true
    },
    {
      id: '2',
      name: 'Progressive Readers',
      description: 'قراءة SAO Progressive خطوة بخطوة',
      members: [
        { id: '4', username: 'المحقق_كلاين', avatar: '🔍', level: 45, isOnline: true },
        { id: '5', username: 'سينون_القناصة', avatar: '🎯', level: 58, isOnline: false }
      ],
      currentBook: 'SAO Progressive المجلد 7',
      progress: 23,
      nextMeeting: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isJoined: false
    }
  ]);

  const [discussions] = useState<Discussion[]>([
    {
      id: '1',
      author: { id: '1', username: 'كيريتو_العرب', avatar: '⚔️', level: 95, isOnline: true },
      content: 'ما رأيكم في التطور الذي حدث لشخصية كيريتو في Alicization؟ شعرت أن هناك نضج كبير في طريقة تفكيره.',
      chapter: 'الفصل 15',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      likes: 12,
      hasLiked: false,
      spoilerLevel: 'mild',
      replies: [
        {
          id: '1-1',
          author: { id: '2', username: 'أسونا_النور', avatar: '🌟', level: 87, isOnline: true },
          content: 'أتفق معك تماماً! خاصة في موقفه من Alice والطريقة التي تعامل بها مع الوضع.',
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
          likes: 5,
          hasLiked: true
        }
      ]
    },
    {
      id: '2',
      author: { id: '3', username: 'أليس_الفارسة', avatar: '🛡️', level: 76, isOnline: false },
      content: 'هل لاحظ أحد الرمزية في معركة Administrator؟ كانت مذهلة!',
      chapter: 'الفصل 18',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      likes: 8,
      hasLiked: true,
      spoilerLevel: 'major',
      replies: []
    }
  ]);

  const [quotes] = useState<Quote[]>([
    {
      id: '1',
      text: 'هذه ليست لعبة بعد الآن، إنها واقعنا الجديد.',
      author: { id: '1', username: 'كيريتو_العرب', avatar: '⚔️', level: 95, isOnline: true },
      chapter: 'الفصل 1',
      series: 'SAO',
      likes: 25,
      hasLiked: false,
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000)
    },
    {
      id: '2', 
      text: 'في هذا العالم، الرحمة قوة، وليس ضعفاً.',
      author: { id: '2', username: 'أسونا_النور', avatar: '🌟', level: 87, isOnline: true },
      chapter: 'الفصل 5',
      series: 'SAO Alicization',
      likes: 18,
      hasLiked: true,
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000)
    }
  ]);

  const [challenges] = useState<Challenge[]>([
    {
      id: '1',
      title: 'تحدي القراءة السريعة',
      description: 'اقرأ 100 صفحة في يوم واحد',
      type: 'pages',
      target: 100,
      participants: [
        { id: '1', username: 'كيريتو_العرب', avatar: '⚔️', level: 95, isOnline: true },
        { id: '2', username: 'أسونا_النور', avatar: '🌟', level: 87, isOnline: true }
      ],
      endDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      prize: 'شارة القارئ السريع + 500 XP',
      isJoined: false,
      progress: 0
    },
    {
      id: '2',
      title: 'سلسلة القراءة الأسبوعية',
      description: 'اقرأ يومياً لمدة 7 أيام متتالية',
      type: 'streak',
      target: 7,
      participants: [
        { id: '3', username: 'أليس_الفارسة', avatar: '🛡️', level: 76, isOnline: false }
      ],
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      prize: 'شارة المثابرة + مجلد مجاني',
      isJoined: true,
      progress: 3
    }
  ]);

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'منذ قليل';
    if (diffInHours < 24) return `منذ ${diffInHours} ساعة`;
    const days = Math.floor(diffInHours / 24);
    return `منذ ${days} يوم`;
  };

  const getSpoilerColor = (level: Discussion['spoilerLevel']) => {
    switch (level) {
      case 'none': return 'bg-green-100 text-green-800';
      case 'mild': return 'bg-yellow-100 text-yellow-800';
      case 'major': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getChallengeIcon = (type: Challenge['type']) => {
    switch (type) {
      case 'reading-speed': return Zap;
      case 'pages': return BookOpen;
      case 'streak': return Flame;
      case 'discussion': return MessageCircle;
      default: return Target;
    }
  };

  return (
    <div className="social-reading-hub max-w-7xl mx-auto p-6">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
          🤝 مركز القراءة الاجتماعي
        </h1>
        <p className="text-gray-600">انضم إلى مجتمع القراء وشارك تجربتك</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="clubs" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            نوادي القراءة
          </TabsTrigger>
          <TabsTrigger value="discussions" className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            المناقشات
          </TabsTrigger>
          <TabsTrigger value="quotes" className="flex items-center gap-2">
            <Quote className="w-4 h-4" />
            الاقتباسات
          </TabsTrigger>
          <TabsTrigger value="challenges" className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            التحديات
          </TabsTrigger>
        </TabsList>

        <TabsContent value="clubs" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {readingClubs.map(club => (
              <Card key={club.id} className="p-6 hover:shadow-lg transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{club.name}</h3>
                    <p className="text-gray-600 text-sm mb-3">{club.description}</p>
                  </div>
                  {club.isJoined && (
                    <Badge className="bg-green-100 text-green-800">عضو</Badge>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-blue-500" />
                    <span className="text-sm">الكتاب الحالي: {club.currentBook}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">تقدم المجموعة</span>
                    <span className="text-sm font-medium">{club.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-400 to-purple-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${club.progress}%` }}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-green-500" />
                    <span className="text-sm">الاجتماع القادم: {club.nextMeeting.toLocaleDateString('ar')}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-2">
                      {club.members.slice(0, 3).map(member => (
                        <div
                          key={member.id}
                          className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white text-sm border-2 border-white relative"
                          title={member.username}
                        >
                          {member.avatar}
                          {member.isOnline && (
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
                          )}
                        </div>
                      ))}
                      {club.members.length > 3 && (
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-xs border-2 border-white">
                          +{club.members.length - 3}
                        </div>
                      )}
                    </div>

                    <Button 
                      variant={club.isJoined ? "outline" : "default"}
                      size="sm"
                      className={club.isJoined ? "border-red-300 text-red-600 hover:bg-red-50" : ""}
                    >
                      {club.isJoined ? 'مغادرة' : 'انضمام'}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="discussions" className="space-y-6">
          <Card className="p-4">
            <div className="flex gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white">
                👤
              </div>
              <div className="flex-1">
                <Textarea
                  placeholder="شارك أفكارك حول الفصل الحالي..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="mb-3"
                />
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <select className="px-3 py-1 border rounded-md text-sm">
                      <option>مستوى الحرق</option>
                      <option value="none">بلا حرق</option>
                      <option value="mild">حرق بسيط</option>
                      <option value="major">حرق كبير</option>
                    </select>
                  </div>
                  <Button size="sm" disabled={!newComment.trim()}>
                    <Send className="w-4 h-4 mr-2" />
                    نشر
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          <div className="space-y-4">
            {discussions.map(discussion => (
              <Card key={discussion.id} className="p-6">
                <div className="flex gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white">
                      {discussion.author.avatar}
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-yellow-400 text-black rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                      {discussion.author.level}
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold">{discussion.author.username}</h4>
                      {discussion.author.badge && (
                        <Badge variant="secondary" className="text-xs">
                          <Crown className="w-3 h-3 mr-1" />
                          {discussion.author.badge}
                        </Badge>
                      )}
                      <Badge className={getSpoilerColor(discussion.spoilerLevel)}>
                        {discussion.spoilerLevel === 'none' ? 'بلا حرق' :
                         discussion.spoilerLevel === 'mild' ? 'حرق بسيط' : 'حرق كبير'}
                      </Badge>
                      <span className="text-xs text-gray-500">{formatTimeAgo(discussion.timestamp)}</span>
                    </div>

                    <p className="text-gray-700 mb-3">{discussion.content}</p>

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <button className={`flex items-center gap-1 hover:text-red-500 transition-colors ${discussion.hasLiked ? 'text-red-500' : ''}`}>
                        <Heart className={`w-4 h-4 ${discussion.hasLiked ? 'fill-current' : ''}`} />
                        {discussion.likes}
                      </button>
                      <button className="flex items-center gap-1 hover:text-blue-500 transition-colors">
                        <MessageCircle className="w-4 h-4" />
                        {discussion.replies.length} رد
                      </button>
                      <button className="flex items-center gap-1 hover:text-green-500 transition-colors">
                        <Share2 className="w-4 h-4" />
                        مشاركة
                      </button>
                    </div>

                    {discussion.replies.length > 0 && (
                      <div className="mt-4 space-y-3 border-l-2 border-gray-200 pl-4">
                        {discussion.replies.map(reply => (
                          <div key={reply.id} className="flex gap-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-gray-400 to-gray-600 rounded-full flex items-center justify-center text-white text-sm">
                              {reply.author.avatar}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-sm">{reply.author.username}</span>
                                <span className="text-xs text-gray-500">{formatTimeAgo(reply.timestamp)}</span>
                              </div>
                              <p className="text-sm text-gray-700 mb-2">{reply.content}</p>
                              <button className={`flex items-center gap-1 text-xs hover:text-red-500 transition-colors ${reply.hasLiked ? 'text-red-500' : 'text-gray-500'}`}>
                                <Heart className={`w-3 h-3 ${reply.hasLiked ? 'fill-current' : ''}`} />
                                {reply.likes}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="quotes" className="space-y-6">
          <Card className="p-4">
            <div className="flex gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white">
                👤
              </div>
              <div className="flex-1">
                <Textarea
                  placeholder="شارك اقتباسك المفضل من القصة..."
                  className="mb-3"
                />
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <Input placeholder="الفصل" className="w-24" />
                    <select className="px-3 py-2 border rounded-md">
                      <option>السلسلة</option>
                      <option value="sao">SAO الأساسي</option>
                      <option value="progressive">SAO Progressive</option>
                      <option value="alicization">Alicization</option>
                    </select>
                  </div>
                  <Button size="sm">
                    <Quote className="w-4 h-4 mr-2" />
                    نشر الاقتباس
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {quotes.map(quote => (
              <Card key={quote.id} className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 border-l-4 border-blue-400">
                <div className="mb-4">
                  <Quote className="w-8 h-8 text-blue-400 mb-3" />
                  <blockquote className="text-lg font-medium text-gray-800 mb-4 italic">
                    "{quote.text}"
                  </blockquote>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white text-sm">
                      {quote.author.avatar}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{quote.author.username}</div>
                      <div className="text-xs text-gray-500">{quote.series} - {quote.chapter}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <button className={`flex items-center gap-1 hover:text-red-500 transition-colors ${quote.hasLiked ? 'text-red-500' : 'text-gray-500'}`}>
                      <Heart className={`w-4 h-4 ${quote.hasLiked ? 'fill-current' : ''}`} />
                      {quote.likes}
                    </button>
                    <span className="text-gray-400">{formatTimeAgo(quote.timestamp)}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="challenges" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {challenges.map(challenge => {
              const IconComponent = getChallengeIcon(challenge.type);
              const progressPercentage = challenge.progress ? (challenge.progress / challenge.target) * 100 : 0;
              const daysLeft = Math.ceil((challenge.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

              return (
                <Card key={challenge.id} className="p-6 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-red-400 rounded-full flex items-center justify-center text-white">
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{challenge.title}</h3>
                        <p className="text-sm text-gray-600">{challenge.description}</p>
                      </div>
                    </div>
                    {challenge.isJoined && (
                      <Badge className="bg-blue-100 text-blue-800">منضم</Badge>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span>الهدف: {challenge.target} {
                        challenge.type === 'pages' ? 'صفحة' :
                        challenge.type === 'streak' ? 'يوم' :
                        challenge.type === 'reading-speed' ? 'كلمة/دقيقة' :
                        'مشاركة'
                      }</span>
                      <span className="text-orange-600 font-medium">
                        <Clock className="w-4 h-4 inline mr-1" />
                        {daysLeft} يوم متبقي
                      </span>
                    </div>

                    {challenge.isJoined && challenge.progress !== undefined && (
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>التقدم</span>
                          <span>{challenge.progress}/{challenge.target}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-orange-400 to-red-400 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex -space-x-2">
                        {challenge.participants.slice(0, 3).map(participant => (
                          <div
                            key={participant.id}
                            className="w-6 h-6 bg-gradient-to-r from-orange-400 to-red-400 rounded-full flex items-center justify-center text-white text-xs border-2 border-white"
                            title={participant.username}
                          >
                            {participant.avatar}
                          </div>
                        ))}
                        {challenge.participants.length > 3 && (
                          <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-xs border-2 border-white">
                            +{challenge.participants.length - 3}
                          </div>
                        )}
                      </div>

                      <Button 
                        variant={challenge.isJoined ? "outline" : "default"}
                        size="sm"
                        className={challenge.isJoined ? "border-red-300 text-red-600 hover:bg-red-50" : "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"}
                      >
                        {challenge.isJoined ? 'مغادرة' : 'انضمام'}
                      </Button>
                    </div>

                    <div className="bg-yellow-50 p-3 rounded-lg border-l-4 border-yellow-400">
                      <div className="flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-yellow-600" />
                        <span className="text-sm font-medium text-yellow-800">الجائزة:</span>
                      </div>
                      <p className="text-sm text-yellow-700 mt-1">{challenge.prize}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SocialReadingHub;
