import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Badge } from './ui/badge';
import { createDebate } from '../services/api';

export default function CreateDebate() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    visibility: 'PUBLIC',
    hashtags: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const parseHashtags = (hashtagString: string): string[] => {
    return hashtagString
      .split(/[\s,]+/)
      .map((t) => t.trim())
      .filter((tag) => tag.length > 1)
      .map((tag) => (tag.startsWith('#') ? tag : `#${tag}`))
      .slice(0, 10);
  };

  const hashtags = parseHashtags(formData.hashtags);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const created = await createDebate({
        title: formData.title.trim(),
        description: formData.description.trim(),
        visibility: formData.visibility,
        hashtags,
      });
      navigate(`/dashboard/room/${encodeURIComponent(created.roomId)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create debate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <h2 className="text-3xl text-gray-900">Create a Debate</h2>

      <Card>
        <CardHeader>
          <CardTitle>Debate Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{error}</p>
            )}
            <div className="space-y-2">
              <Label htmlFor="title">Debate Title</Label>
              <Input
                id="title"
                type="text"
                placeholder="Enter debate title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe what this debate is about..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                required
              />
            </div>

            <div className="space-y-3">
              <Label>Debate Visibility</Label>
              <RadioGroup
                value={formData.visibility}
                onValueChange={(value) => setFormData({ ...formData, visibility: value })}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="PUBLIC" id="public" />
                  <Label htmlFor="public" className="cursor-pointer">
                    Public — discoverable by title and hashtags
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="PRIVATE" id="private" />
                  <Label htmlFor="private" className="cursor-pointer">
                    Private — join only with Room ID
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hashtags">Hashtags</Label>
              <Input
                id="hashtags"
                type="text"
                placeholder="#technology #ethics (up to 10)"
                value={formData.hashtags}
                onChange={(e) => setFormData({ ...formData, hashtags: e.target.value })}
              />
              <p className="text-xs text-gray-500">
                Separate with spaces or commas. Public debates can be found by searching these tags.
              </p>
              {hashtags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {hashtags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm mb-2">After you create</h4>
              <p className="text-xs text-gray-600">
                You will be taken to your room as host. Share the Room ID for private invites; public debates appear in
                search and recommendations.
              </p>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? 'Creating…' : 'Create Debate'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
