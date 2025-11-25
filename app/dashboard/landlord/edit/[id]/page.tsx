import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import EditPropertyForm from './edit-form'; // We will separate the client form

export default async function EditPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  // 1. Fetch the specific property
  const { data: property } = await supabase
    .from('properties')
    .select('*, rooms(*)') // Get property AND its rooms
    .eq('id', params.id)
    .eq('owner_id', user?.id) // Security: Ensure they own it
    .single();

  if (!property) {
    return <div className="text-white text-center pt-32">Property not found or access denied.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 pt-32 pb-12 px-4">
        <div className="max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-8">Edit Property: <span className="text-indigo-400">{property.title}</span></h1>
            {/* Pass data to the client form */}
            <EditPropertyForm property={property} />
        </div>
    </div>
  );
}