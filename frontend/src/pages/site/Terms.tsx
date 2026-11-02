import { useTitle } from '@/lib/useTitle';

export default function Terms() {
  useTitle('Terms of Service');
  return (
    <article className="prose-tv mx-auto max-w-3xl">
      <h1 className="text-3xl font-semibold">Terms of Service</h1>
      <p><em>Template text: have it reviewed by a legal professional and adapt it to Techvoto before launch.</em></p>
      <h2>1. Overview</h2>
      <p>Techvoto provides an online learning platform. By creating an account you agree to use it lawfully and respectfully.</p>
      <h2>2. Accounts</h2>
      <p>Keep your login details secure. You are responsible for activity on your account.</p>
      <h2>3. Payments and refunds</h2>
      <p>Paid courses are charged in Nigerian naira through Paystack. Describe your refund policy here.</p>
      <h2>4. Your data</h2>
      <p>We store the information needed to run your account, track progress and issue certificates. Describe what you collect, why, how long you keep it and how users can request deletion.</p>
      <h2>5. Contact</h2>
      <p>Questions? Contact the Techvoto team.</p>
    </article>
  );
}
