'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type { User } from '@/types';
import { Input, Avatar, Button } from '@/components/ui';
import { Search, X, CheckCircle } from 'lucide-react';
import apiClient from '@/lib/api/client';

interface UserSelectorProps {
  onSelect: (user: User | null) => void;
  selectedUser: User | null;
  placeholder?: string;
  error?: string;
}

export function UserSelector({
  onSelect,
  selectedUser,
  placeholder = 'Search by email or name...',
  error,
}: UserSelectorProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<User[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const searchUsers = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      return;
    }

    try {
      setIsSearching(true);
      const response = await apiClient.get<User[]>('/users/search', {
        params: { query: q },
      });
      setResults(response.data);
    } catch (err) {
      console.error('Failed to search users:', err);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleInputChange = (value: string) => {
    setQuery(value);
    setIsOpen(true);

    // Debounce search
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      searchUsers(value);
    }, 300);
  };

  const handleSelect = (user: User) => {
    onSelect(user);
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };

  const handleClear = () => {
    onSelect(null);
    setQuery('');
    setResults([]);
  };

  if (selectedUser) {
    return (
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">Borrower</label>
        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-3">
            <Avatar name={selectedUser.name} size="sm" />
            <div>
              <p className="font-medium text-gray-900">{selectedUser.name}</p>
              <p className="text-sm text-gray-600">{selectedUser.email}</p>
            </div>
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-gray-700">
        Borrower (search by email or name)
      </label>
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={() => setIsOpen(true)}
            className="pl-10"
            error={error}
          />
        </div>

        {/* Dropdown Results */}
        {isOpen && (query.length > 0 || results.length > 0) && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            {isSearching ? (
              <div className="p-4 text-center text-gray-500">
                <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
              </div>
            ) : results.length > 0 ? (
              <div className="max-h-64 overflow-y-auto">
                {results.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleSelect(user)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar name={user.name} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {user.name}
                        </p>
                        <p className="text-sm text-gray-600 truncate">
                          {user.email}
                        </p>
                      </div>
                      {user.trustScore && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          Trust: {user.trustScore}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            ) : query.length >= 2 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                No users found
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
