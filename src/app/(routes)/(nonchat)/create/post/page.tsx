import { CreatePostForm } from "../_components/create-post-form";

export default function Page() {
  return (
    <div className="flex h-[800px] w-full flex-col items-center justify-center gap-10">
      <CreatePostForm />
    </div>
  );
}
