export default function Page({ params }: { params: { userId: string } }) {
  return <div>Profile Page {params.userId}</div>;
}
