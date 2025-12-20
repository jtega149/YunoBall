import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

// Mock data - In production, this will come from your Spring Boot backend API
const pastDebates = [
  {
    id: 1,
    title: 'Climate Change Policy Reform',
    date: '2024-12-15',
    status: 'win'
  },
  {
    id: 2,
    title: 'AI Regulation and Ethics',
    date: '2024-12-10',
    status: 'loss'
  },
  {
    id: 3,
    title: 'Universal Basic Income',
    date: '2024-12-05',
    status: 'win'
  },
  {
    id: 4,
    title: 'Social Media Privacy Laws',
    date: '2024-11-28',
    status: 'win'
  }
];

const recommendedDebates = [
  {
    id: 5,
    title: 'Cryptocurrency as Legal Tender',
    participants: 12,
    hashtags: ['#crypto', '#finance', '#policy']
  },
  {
    id: 6,
    title: 'Space Exploration Funding',
    participants: 8,
    hashtags: ['#space', '#science', '#budget']
  },
  {
    id: 7,
    title: 'Education System Modernization',
    participants: 15,
    hashtags: ['#education', '#technology', '#reform']
  }
];

export default function Home() {
  return (
    <div className="space-y-8">
      {/* Past Debates Section */}
      <section>
        <h2 className="text-3xl mb-6 text-gray-900">Past Debates</h2>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {pastDebates.map((debate) => (
            <Card key={debate.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{debate.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">{debate.date}</span>
                  <Badge 
                    variant={debate.status === 'win' ? 'default' : 'destructive'}
                  >
                    {debate.status === 'win' ? 'Win' : 'Loss'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Recommended Ongoing Debates Section */}
      <section>
        <h2 className="text-3xl mb-6 text-gray-900">Recommended Ongoing Debates</h2>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {recommendedDebates.map((debate) => (
            <Card key={debate.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="text-lg">{debate.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm text-gray-500">
                    {debate.participants} participants
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {debate.hashtags.map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
