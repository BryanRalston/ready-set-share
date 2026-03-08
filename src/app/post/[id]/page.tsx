import PostPageClient from './PostPageClient';

export function generateStaticParams() {
  return [{ id: 'new' }];
}

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PostPageClient id={id} />;
}
