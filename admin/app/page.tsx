import Link from "next/link";

export default function Home() {
  return (
    <div>
      Welcome to the Admin Panel - Multi-Tenant PM SaaS 
      <div>
        <Link href="/login">Signin</Link>
      </div>
    </div>
  );
}
