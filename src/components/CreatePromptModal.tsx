"use client";

import { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Copy, 
  Maximize, 
  Minimize, 
  Check,
  Plus
} from 'lucide-react';

interface CreatePromptModalProps {
  onClose: () => void;
  onSave: (prompt: {
    title: string;
    description: string;
    category: string;
    tags: string[];
    rating: number;
    content: {
      prompt: string;
      example: string;
      howToUse: string;
    };
    format: string;
  }) => void;
}

type TabType = 'prompt' | 'example' | 'howToUse';
type FormatType = 'json' | 'markdown' | 'xml' | 'yaml' | 'csv';

const CreatePromptModal: React.FC<CreatePromptModalProps> = ({ onClose, onSave }) => {
  const [activeTab, setActiveTab] = useState<TabType>('prompt');
  const [format, setFormat] = useState<FormatType>('json');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [content, setContent] = useState({
    prompt: '',
    example: '',
    howToUse: ''
  });

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const formats = ['json', 'markdown', 'xml', 'yaml', 'csv'] as const;
  const tabs = [
    { id: 'prompt', label: 'Prompt' },
    { id: 'example', label: 'Example' },
    { id: 'howToUse', label: 'How to Use' }
  ] as const;

  const handleContentChange = (value: string) => {
    setContent(prev => ({
      ...prev,
      [activeTab]: value
    }));
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content[activeTab]);
      alert('Content copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSave = () => {
    if (!title.trim() || !description.trim()) {
      alert('Please fill in title and description');
      return;
    }

    onSave({
      title,
      description,
      category: category || 'general',
      tags,
      rating: 0,
      content,
      format
    });
  };

  const formatContent = (text: string, targetFormat: FormatType) => {
    if (!text) return '';
    
    switch (targetFormat) {
      case 'json':
        return JSON.stringify({ prompt: text }, null, 2);
      case 'markdown':
        return `# Prompt\n\n${text}`;
      case 'xml':
        return `<prompt>\n  <content>${text}</content>\n</prompt>`;
      case 'yaml':
        return `prompt: |\n  ${text.replace(/\n/g, '\n  ')}`;
      case 'csv':
        return `"prompt"\n"${text.replace(/"/g, '""')}"`;
      default:
        return text;
    }
  };

  const getSyntaxHighlighting = (format: FormatType) => {
    switch (format) {
      case 'json':
        return 'language-json';
      case 'markdown':
        return 'language-markdown';
      case 'xml':
        return 'language-xml';
      case 'yaml':
        return 'language-yaml';
      case 'csv':
        return 'language-csv';
      default:
        return '';
    }
  };

  const currentContent = content[activeTab];
  const formattedContent = formatContent(currentContent, format);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`bg-white rounded-lg shadow-xl ${isFullscreen ? 'w-full h-full' : 'w-full max-w-4xl h-[90vh]'} flex flex-col`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Create New Prompt</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="p-6 space-y-6 overflow-y-auto">
            {/* Title and Description */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter prompt title..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Enter prompt description..."
                />
              </div>
            </div>

            {/* Tabbed Code Editor */}
            <div className="space-y-4">
              <div className="flex flex-wrap border-b border-gray-200">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'border-b-2 border-blue-500 text-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Code Editor */}
              <div className="relative">
                <div className="absolute top-3 right-3 flex space-x-2 z-10">
                  <button
                    onClick={handleCopy}
                    className="p-2 rounded-md bg-gray-800 hover:bg-gray-700 text-white transition-colors"
                    title="Copy"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="p-2 rounded-md bg-gray-800 hover:bg-gray-700 text-white transition-colors"
                    title="Fullscreen"
                  >
                    <Maximize className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="bg-gray-900 rounded-lg p-4 min-h-[300px] font-mono text-sm overflow-auto">
                  <textarea
                    ref={textareaRef}
                    value={currentContent}
                    onChange={(e) => handleContentChange(e.target.value)}
                    placeholder="Start typing your prompt here..."
                    className="w-full h-full min-h-[250px] bg-transparent text-green-400 placeholder-gray-500 resize-none focus:outline-none"
                    style={{
                      fontFamily: 'Monaco, Consolas, "Lucida Console", monospace',
                      fontSize: '14px',
                      lineHeight: '1.5'
                    }}
                  />
                </div>
              </div>

              {/* Format Preview */}
              {currentContent && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Formatted Output:</h4>
                  <pre className="bg-gray-100 p-3 rounded-md text-sm overflow-x-auto">
                    <code className={getSyntaxHighlighting(format)}>
                      {formattedContent}
                    </code>
                  </pre>
                </div>
              )}
            </div>

            {/* Structure Format Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Structure Format:</label>
              <div className="flex flex-wrap gap-2">
                {formats.map((formatOption) => (
                  <button
                    key={formatOption}
                    onClick={() => setFormat(formatOption)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      format === formatOption
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {formatOption}
                  </button>
                ))}
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category:</label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter category..."
                />
                {category && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                    {category}
                    <X 
                      className="ml-2 w-3 h-3 cursor-pointer hover:text-purple-600" 
                      onClick={() => setCategory('')}
                    />
                  </span>
                )}
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tags:</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                    {tag}
                    <X 
                      className="ml-2 w-3 h-3 cursor-pointer hover:text-yellow-600" 
                      onClick={() => handleRemoveTag(tag)}
                    />
                  </span>
                ))}
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Add a tag and press Enter..."
                />
                <button
                  onClick={handleAddTag}
                  className="p-2 rounded-md bg-blue-500 hover:bg-blue-600 text-white transition-colors"
                  title="Add Tag"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium transition-colors flex items-center space-x-2"
          >
            <Check className="w-4 h-4" />
            <span>Save</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePromptModal;
