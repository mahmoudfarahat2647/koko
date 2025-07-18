"use client";

import { useState } from 'react';
import { 
  Star, 
  Share2, 
  Edit3, 
  Copy, 
  Trash2, 
  User, 
  Search,
  X,
  Plus
} from 'lucide-react';
import CreatePromptModal from '../components/CreatePromptModal';

interface PromptCard {
  id: number;
  title: string;
  description: string;
  category: string;
  tags: string[];
  rating: number;
}

const dummyData: PromptCard[] = [
  {
    id: 1,
    title: 'Creative Writing Prompt',
    description: 'Generate engaging stories with unique characters and plot twists',
    category: 'writing',
    tags: ['chatgpt', 'super'],
    rating: 4
  },
  {
    id: 2,
    title: 'Code Review Assistant',
    description: 'Analyze code quality and suggest improvements',
    category: 'frontend',
    tags: ['work', 'prompt'],
    rating: 5
  },
  {
    id: 3,
    title: 'Brand Voice Generator',
    description: 'Create consistent brand messaging across platforms',
    category: 'vibe',
    tags: ['chatgpt', 'work'],
    rating: 3
  },
  {
    id: 4,
    title: 'API Documentation Writer',
    description: 'Generate comprehensive API documentation',
    category: 'backend',
    tags: ['work', 'vit'],
    rating: 4
  },
  {
    id: 5,
    title: 'Artistic Style Advisor',
    description: 'Provide guidance on artistic techniques and styles',
    category: 'artist',
    tags: ['super', 'vit'],
    rating: 5
  },
  {
    id: 6,
    title: 'UI Component Generator',
    description: 'Create reusable UI components with best practices',
    category: 'frontend',
    tags: ['prompt', 'work'],
    rating: 4
  },
  {
    id: 7,
    title: 'Database Query Optimizer',
    description: 'Optimize SQL queries for better performance',
    category: 'backend',
    tags: ['work', 'super'],
    rating: 3
  },
  {
    id: 8,
    title: 'Creative Storytelling',
    description: 'Craft compelling narratives for various media',
    category: 'writing',
    tags: ['chatgpt', 'vit'],
    rating: 5
  }
];

const categories = ['ALL', 'vibe', 'artist', 'writing', 'frontend', 'backend'];
const tags = ['ALL', 'chatgpt', 'super', 'prompt', 'work', 'vit'];

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedTag, setSelectedTag] = useState('ALL');
  const [prompts, setPrompts] = useState(dummyData);
  const [showCreatePrompt, setShowCreatePrompt] = useState(false);

  const filteredPrompts = prompts.filter(prompt => {
    const matchesSearch = prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prompt.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || prompt.category === selectedCategory;
    const matchesTag = selectedTag === 'ALL' || prompt.tags.includes(selectedTag);
    
    return matchesSearch && matchesCategory && matchesTag;
  });

  const handleRatingChange = (promptId: number, newRating: number) => {
    setPrompts(prompts.map(prompt => 
      prompt.id === promptId ? { ...prompt, rating: newRating } : prompt
    ));
  };

  const handleDelete = (promptId: number) => {
    setPrompts(prompts.filter(prompt => prompt.id !== promptId));
  };

  const handleCopy = (prompt: PromptCard) => {
    navigator.clipboard.writeText(`${prompt.title}: ${prompt.description}`);
    alert('Prompt copied to clipboard!');
  };

  const handleShare = (prompt: PromptCard) => {
    if (navigator.share) {
      navigator.share({
        title: prompt.title,
        text: prompt.description,
        url: window.location.href
      });
    } else {
      alert('Sharing not supported on this browser');
    }
  };

  const handleEdit = (prompt: PromptCard) => {
    alert(`Edit functionality for "${prompt.title}" would be implemented here`);
  };

  const renderStars = (rating: number, promptId: number) => {
    return [...Array(5)].map((_, index) => {
      const starNumber = index + 1;
      return (
        <Star
          key={index}
          className={`w-4 h-4 cursor-pointer transition-colors ${
            starNumber <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
          }`}
          onClick={() => handleRatingChange(promptId, starNumber)}
        />
      );
    });
  };

  const removeChip = (promptId: number, type: 'title' | 'description') => {
    alert(`Remove ${type} chip functionality would be implemented here`);
  };

  return (
    <main className="flex flex-col min-h-screen bg-gray-50">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row justify-between items-center p-4 bg-slate-800 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-2 md:mb-0">PROMPTBOX</h1>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              type="text"
              placeholder="Search prompts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary w-64 placeholder:text-muted-foreground"
            />
          </div>
          <User className="w-8 h-8 cursor-pointer hover:text-blue-300 transition-colors" />
        </div>
      </header>

      {/* Filters Section */}
      <section className="p-4 bg-white shadow-sm">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Categories:</h3>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-500 text-white'
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Tags:</h3>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedTag === tag
                    ? 'bg-green-500 text-white'
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Prompt Cards Grid */}
      <section className="p-4 flex-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPrompts.map((prompt) => (
            <div key={prompt.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6">
              {/* Rating */}
              <div className="flex items-center mb-3">
                {renderStars(prompt.rating, prompt.id)}
              </div>
              
              {/* Title Chip */}
              <div className="flex items-center justify-between mb-3">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                  {prompt.title}
                  <X 
                    className="ml-2 w-3 h-3 cursor-pointer hover:text-purple-600" 
                    onClick={() => removeChip(prompt.id, 'title')}
                  />
                </span>
              </div>
              
              {/* Description Chip */}
              <div className="mb-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700">
                  {prompt.description.length > 50 
                    ? `${prompt.description.substring(0, 50)}...` 
                    : prompt.description}
                  <X 
                    className="ml-2 w-3 h-3 cursor-pointer hover:text-gray-500" 
                    onClick={() => removeChip(prompt.id, 'description')}
                  />
                </span>
              </div>
              
              {/* Tags and Category */}
              <div className="flex flex-wrap gap-2 mb-4">
                {prompt.tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    {tag}
                    <X className="ml-1 w-3 h-3 cursor-pointer hover:text-yellow-600" />
                  </span>
                ))}
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                  {prompt.category}
                  <X className="ml-1 w-3 h-3 cursor-pointer hover:text-indigo-600" />
                </span>
              </div>
              
              {/* Action Icons */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleDelete(prompt.id)}
                  className="p-2 rounded-full hover:bg-red-100 transition-colors group"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4 text-gray-500 group-hover:text-red-500" />
                </button>
                <button
                  onClick={() => handleShare(prompt)}
                  className="p-2 rounded-full hover:bg-blue-100 transition-colors group"
                  title="Share"
                >
                  <Share2 className="w-4 h-4 text-gray-500 group-hover:text-blue-500" />
                </button>
                <button
                  onClick={() => handleEdit(prompt)}
                  className="p-2 rounded-full hover:bg-green-100 transition-colors group"
                  title="Edit"
                >
                  <Edit3 className="w-4 h-4 text-gray-500 group-hover:text-green-500" />
                </button>
                <button
                  onClick={() => handleCopy(prompt)}
                  className="p-2 rounded-full hover:bg-purple-100 transition-colors group"
                  title="Copy"
                >
                  <Copy className="w-4 h-4 text-gray-500 group-hover:text-purple-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {filteredPrompts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No prompts found matching your criteria.</p>
          </div>
        )}
      </section>

      {/* Floating Create Button */}
      <button
        onClick={() => setShowCreatePrompt(true)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group z-50"
        title="Create New Prompt"
      >
        <Plus className="w-8 h-8 group-hover:scale-110 transition-transform" />
      </button>

      {/* Create Prompt Modal */}
      {showCreatePrompt && (
        <CreatePromptModal 
          onClose={() => setShowCreatePrompt(false)} 
          onSave={(newPrompt) => {
            setPrompts([...prompts, { ...newPrompt, id: Date.now() }]);
            setShowCreatePrompt(false);
          }}
        />
      )}
    </main>
  );
}
