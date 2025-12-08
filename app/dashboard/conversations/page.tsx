import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { MessageCircle, Home, User, Clock } from 'lucide-react';
import Link from 'next/link';
import ConversationsList from '@/app/dashboard/conversations/conversations-list';

export default async function ConversationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/auth/login');

  // Get user profile to determine role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile) {
    redirect('/auth/login');
  }

  const isStudent = profile?.role === 'student';

  // Fetch conversations with property and user details
  const { data: conversations, error: convError } = await supabase
    .from('conversations')
    .select(`
      *,
      properties(id, title, image_url)
    `)
    .order('last_message_at', { ascending: false });

  if (convError) {
    console.error('Conversations fetch error:', convError);
    return (
      <div className="min-h-screen bg-gray-950 text-white py-10 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Unable to load conversations</h1>
          <p className="text-gray-400 mb-4">{convError.message}</p>
          <Link 
            href={isStudent ? '/dashboard/student' : '/dashboard/landlord'}
            className="px-4 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-500 transition"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Enrich with profile names
  const enrichedConversations = await Promise.all(
    (conversations || []).map(async (conv) => {
      const otherUserId = isStudent ? conv.landlord_id : conv.student_id;
      const { data: otherProfile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', otherUserId)
        .single();

      return {
        ...conv,
        otherUserName: otherProfile?.full_name || 'Unknown User',
        otherUserId,
      };
    })
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white pt-28 pb-10 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <MessageCircle className="mr-3 text-indigo-400" size={32} />
              Messages
            </h1>
            <p className="text-gray-400 mt-1">
              {isStudent ? 'Chat with landlords about properties' : 'Respond to student inquiries'}
            </p>
          </div>
          <Link
            href={isStudent ? '/dashboard/student' : '/dashboard/landlord'}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition"
          >
            Back to Dashboard
          </Link>
        </div>

        {/* Conversations List */}
        {enrichedConversations.length === 0 ? (
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-12 text-center">
            <MessageCircle className="mx-auto mb-4 text-gray-600" size={64} />
            <h3 className="text-xl font-bold text-gray-400 mb-2">No conversations yet</h3>
            <p className="text-gray-500">
              {isStudent 
                ? 'Start chatting with landlords from property pages' 
                : 'Students will message you about your properties'}
            </p>
          </div>
        ) : (
          <ConversationsList 
            conversations={enrichedConversations} 
            currentUserId={user.id}
            isStudent={isStudent}
          />
        )}
      </div>
    </div>
  );
}
