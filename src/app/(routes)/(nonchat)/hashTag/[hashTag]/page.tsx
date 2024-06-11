export default function Page({ params }: { params: { hashTag: string } }) {
  return <div>HashTag: {params.hashTag}</div>;
}
