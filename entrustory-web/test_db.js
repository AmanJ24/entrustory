import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://bbhjqzmgodtjiymucefo.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJiaGpxem1nb2R0aml5bXVjZWZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1NDc0MjksImV4cCI6MjA4ODEyMzQyOX0._ezI9JkHqc5OOJWvEn_DMrTQeLZecXl9jVfpFuaET04');

async function test() {
  const { data, error } = await supabase.from('versions').select('*').limit(1);
  if (error) console.error(error);
  else console.log(data);
}
test();
