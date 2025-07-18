"use client";

import { useState, useEffect } from 'react';
import { 
  Star, 
  Share2, 
  Edit3, 
  Copy, 
  Trash2, 
  User, 
  Search,
  X,
  Plus,
  Sun,
  Moon
} from 'lucide-react';
import CreatePromptModal from '../components/CreatePromptModal';
import { getSpecificTagColor } from '../lib/tagColors';
import Link from 'next/link';

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
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<PromptCard | null>(null);

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
    setShowCreatePrompt(true);
    setEditingPrompt(prompt);
  };

  const renderStars = (rating: number, promptId: number) => {
    return [...Array(5)].map((_, index) => {
      const starNumber = index + 1;
      return (
        <Star
          key={index}
          className={`w-4 h-4 cursor-pointer transition-colors ${
            starNumber <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'
          }`}
          onClick={() => handleRatingChange(promptId, starNumber)}
        />
      );
    });
  };

  const removeChip = (promptId: number, type: 'title' | 'description') => {
    alert(`Remove ${type} chip functionality would be implemented here`);
  };

  // Theme toggle functionality
  useEffect(() => {
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    
    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <main className="flex flex-col min-h-screen bg-background">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row justify-between items-center p-4 bg-card text-card-foreground shadow-lg">
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
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? (
                <Sun className="w-6 h-6" />
              ) : (
                <Moon className="w-6 h-6" />
              )}
            </button>
            <Link href="/login" className="p-2 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors" title="Login">
              <User className="w-6 h-6" />
            </Link>
          </div>
      </header>

      {/* Filters Section */}
      <section className="p-4 bg-card shadow-sm">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-foreground mb-2">Categories:</h3>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-2">Tags:</h3>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedTag === tag
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
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
            <div key={prompt.id} className="bg-card text-card-foreground rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border border-border">
              {/* Rating */}
              <div className="flex items-center mb-3">
                {renderStars(prompt.rating, prompt.id)}
              </div>
              
              {/* Title Chip */}
              <div className="flex items-center justify-between mb-3">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary text-primary-foreground">
                  {prompt.title}
                  <X 
                    className="ml-2 w-3 h-3 cursor-pointer hover:text-primary/80" 
                    onClick={() => removeChip(prompt.id, 'title')}
                  />
                </span>
              </div>
              
              {/* Description Chip */}
              <div className="mb-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-muted text-muted-foreground">
                  {prompt.description.length > 50 
                    ? `${prompt.description.substring(0, 50)}...` 
                    : prompt.description}
                  <X 
                    className="ml-2 w-3 h-3 cursor-pointer hover:text-muted-foreground/80" 
                    onClick={() => removeChip(prompt.id, 'description')}
                  />
                </span>
              </div>
              
              {/* Tags and Category */}
              <div className="flex flex-wrap gap-2 mb-4">
                {prompt.tags.map((tag) => (
                  <span key={tag} className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSpecificTagColor(tag)}`}>
                    {tag}
                    <X className="ml-1 w-3 h-3 cursor-pointer hover:opacity-80" />
                  </span>
                ))}
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                  {prompt.category}
                  <X className="ml-1 w-3 h-3 cursor-pointer hover:text-secondary-foreground/80" />
                </span>
              </div>
              
              {/* Action Icons */}
              <div className="flex justify-between items-center pt-4 border-t border-border">
                <button
                  onClick={() => handleDelete(prompt.id)}
                  className="p-2 rounded-full hover:bg-destructive/10 transition-colors group"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4 text-muted-foreground group-hover:text-destructive" />
                </button>
                <button
                  onClick={() => handleShare(prompt)}
                  className="p-2 rounded-full hover:bg-primary/10 transition-colors group"
                  title="Share"
                >
                  <Share2 className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                </button>
                <button
                  onClick={() => handleEdit(prompt)}
                  className="p-2 rounded-full hover:bg-accent/10 transition-colors group"
                  title="Edit"
                >
                  <Edit3 className="w-4 h-4 text-muted-foreground group-hover:text-accent" />
                </button>
                <button
                  onClick={() => handleCopy(prompt)}
                  className="p-2 rounded-full hover:bg-secondary/10 transition-colors group"
                  title="Copy"
                >
                  <Copy className="w-4 h-4 text-muted-foreground group-hover:text-secondary" />
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {filteredPrompts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No prompts found matching your criteria.</p>
          </div>
        )}
      </section>

      {/* Floating Create Button */}
      <button
        onClick={() => {
          setShowCreatePrompt(true);
          setEditingPrompt(null);
        }}
        className="fixed bottom-6 right-6 w-16 h-16 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group z-50"
        title="Create New Prompt"
      >
        <Plus className="w-8 h-8 group-hover:scale-110 transition-transform" />
      </button>

      {/* Create Prompt Modal */}
      {showCreatePrompt && (
<CreatePromptModal 
          onClose={() => {
            setShowCreatePrompt(false);
            setEditingPrompt(null);
          }}
          onSave={(newPrompt) => {
            if (editingPrompt) {
              // Update existing prompt
              setPrompts(prompts.map(p => p.id === editingPrompt.id ? { ...newPrompt, id: editingPrompt.id } : p));
              setEditingPrompt(null);
            } else {
              // Add new prompt
              setPrompts([...prompts, { ...newPrompt, id: Date.now() }]);
            }
            setShowCreatePrompt(false);
          }}
          editingPrompt={editingPrompt}
        />
      )}
    </main>
  );
}
