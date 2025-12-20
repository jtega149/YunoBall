import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Badge } from './ui/badge';

export default function CreateDebate() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    visibility: 'public',
    hashtags: ''
  });
  const [generatedRoomId, setGeneratedRoomId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production, this will call your Spring Boot backend API
    // Generate a mock room ID for demonstration
    const roomId = `DBT-${Date.now().toString(36).toUpperCase()}`;
    setGeneratedRoomId(roomId);
    
    // Show success message with room ID
    alert(`Debate created successfully!\nRoom ID: ${roomId}\nShare this ID with others to invite them.`);
  };

  const parseHashtags = (hashtagString: string) => {
    return hashtagString
      .split(/[\s,]+/)
      .filter(tag => tag.startsWith('#') && tag.length > 1)
      .slice(0, 5); // Limit to 5 hashtags
  };

  const hashtags = parseHashtags(formData.hashtags);

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <h2 className="text-3xl text-gray-900">Create a Debate</h2>

      <Card>
        <CardHeader>
          <CardTitle>Debate Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
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

            {/* Description */}
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

            {/* Visibility */}
            <div className="space-y-3">
              <Label>Debate Visibility</Label>
              <RadioGroup
                value={formData.visibility}
                onValueChange={(value) => setFormData({ ...formData, visibility: value })}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="public" id="public" />
                  <Label htmlFor="public" className="cursor-pointer">
                    Public - Anyone can find and join this debate
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="private" id="private" />
                  <Label htmlFor="private" className="cursor-pointer">
                    Private - Only users with the Room ID can join
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Hashtags */}
            <div className="space-y-2">
              <Label htmlFor="hashtags">Hashtags</Label>
              <Input
                id="hashtags"
                type="text"
                placeholder="#technology #AI #ethics (max 5)"
                value={formData.hashtags}
                onChange={(e) => setFormData({ ...formData, hashtags: e.target.value })}
              />
              <p className="text-xs text-gray-500">
                Add hashtags to help others discover your debate. Separate with spaces or commas.
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

            {/* Room ID Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm mb-2">About Room ID</h4>
              <p className="text-xs text-gray-600">
                A unique Room ID will be generated when you create this debate. 
                You can share this ID with anyone to invite them to join as viewers. 
                As the host, you can promote viewers to debaters during the session.
              </p>
            </div>

            {generatedRoomId && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="text-sm mb-2">Room ID Generated</h4>
                <p className="text-lg mono tracking-wide">{generatedRoomId}</p>
              </div>
            )}

            <Button type="submit" className="w-full" size="lg">
              Create Debate
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
