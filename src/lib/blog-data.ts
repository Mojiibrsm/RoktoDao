
export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  author: string;
  excerpt: string;
  content: string;
  image: string;
  hint: string;
}

const posts: BlogPost[] = [
  {
    slug: 'the-importance-of-regular-donation',
    title: 'The Importance of Regular Blood Donation',
    date: 'October 26, 2023',
    author: 'Dr. Jane Doe',
    excerpt: 'Regular blood donation is crucial for maintaining a stable blood supply. Discover why making it a habit can save countless lives and benefit your own health.',
    content: `
      <h2>Why Your Regular Donation Matters</h2>
      <p>Every two seconds, someone in the world needs blood. A stable blood supply is only possible through the generosity of regular, voluntary donors. When you donate blood regularly, you help ensure that safe blood is available for emergencies, surgeries, cancer treatments, and chronic illnesses.</p>
      
      <h2>Health Benefits for Donors</h2>
      <p>Did you know that donating blood can also benefit you? Regular donation can help:</p>
      <ul>
        <li>Reduce excess iron levels in your body, which may lower the risk of heart disease.</li>
        <li>Stimulate the production of new blood cells, keeping your body healthy and efficient.</li>
        <li>Provide a mini-health check-up, as your pulse, blood pressure, and hemoglobin levels are checked each time.</li>
      </ul>
      <p>Making a commitment to donate regularly is one of the most impactful things you can do for your community. Join us and become a lifesaver today.</p>
    `,
    image: 'https://placehold.co/600x400.png',
    hint: 'hospital blood donation',
  },
  {
    slug: 'myths-about-blood-donation',
    title: 'Debunking Common Myths About Blood Donation',
    date: 'October 20, 2023',
    author: 'John Smith',
    excerpt: 'Many people are hesitant to donate blood due to common myths and misconceptions. Let\'s clear the air and separate fact from fiction.',
    content: `
      <h2>Myth 1: "It's painful."</h2>
      <p>The only pain you'll feel is a quick pinch from the needle, which lasts only a second. The rest of the process is comfortable, and you'll be seated or lying down.</p>

      <h2>Myth 2: "I'll feel weak afterwards."</h2>
      <p>Your body replaces the donated plasma within 24 hours. While you should avoid strenuous activity for the rest of the day, most people feel fine. Having a snack and a drink after donation helps your body recover quickly.</p>
      
      <h2>Myth 3: "I can get infected."</h2>
      <p>This is not possible. All equipment used for donation is sterile, single-use, and disposed of immediately after. You cannot contract any diseases by donating blood.</p>
    `,
    image: 'https://placehold.co/600x400.png',
    hint: 'doctor talking patient',
  },
  {
    slug: 'how-your-donation-saves-lives',
    title: 'A Single Pint: How Your Donation Saves Lives',
    date: 'October 15, 2023',
    author: 'Community Team',
    excerpt: 'Ever wondered what happens to your blood after you donate? A single donation can be split into several components to help multiple patients.',
    content: `
      <h2>The Journey of Your Donation</h2>
      <p>After you donate, your blood is taken to a lab and tested to ensure its safety. It is then separated into three main components:</p>
      <ul>
        <li><strong>Red Blood Cells:</strong> Used to treat patients with anemia or those who have lost a significant amount of blood during surgery or trauma.</li>
        <li><strong>Platelets:</strong> Given to cancer patients undergoing chemotherapy or those with blood clotting disorders.</li>
        <li><strong>Plasma:</strong> Often used for burn victims and patients with shock or liver disease.</li>
      </ul>
      <p>This means your single act of kindness can save up to three lives. It's a powerful way to make a direct impact on people in your community.</p>
    `,
    image: 'https://placehold.co/600x400.png',
    hint: 'blood bag laboratory',
  },
];

export function getBlogPosts() {
  return posts;
}

export function getBlogPostBySlug(slug: string) {
  return posts.find((post) => post.slug === slug);
}
