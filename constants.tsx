
import React from 'react';
import { 
  LayoutDashboard, 
  Briefcase, 
  Settings2, 
  Database,
  SearchCode,
  Zap
} from 'lucide-react';

export const COLORS = {
  primary: '#29B5E8',
  darkBlue: '#0E4B7A',
  lightBlue: '#56C4E3',
  success: '#27AE60',
  warning: '#F39C12',
  error: '#E74C3C',
  gray: '#95A5A6',
  background: '#F8F9FA',
  text: '#2C3E50',
};

export const NAVIGATION = [
  { id: 'EXECUTIVE', label: 'Executive View', icon: <LayoutDashboard size={20} /> },
  { id: 'BUSINESS', label: 'Business View', icon: <Briefcase size={20} /> },
  { id: 'TECHNICAL', label: 'Technical View', icon: <Settings2 size={20} /> },
  { id: 'TABLE_ANALYSIS', label: 'Table Analysis', icon: <SearchCode size={20} /> },
  { id: 'PLATFORM', label: 'Platform Settings', icon: <Database size={20} /> },
];

export const MOCK_CHART_DATA = [
  { date: '2023-12-25', score: 92, credits: 4.2 },
  { date: '2023-12-26', score: 91, credits: 5.1 },
  { date: '2023-12-27', score: 94, credits: 3.8 },
  { date: '2023-12-28', score: 93, credits: 4.5 },
  { date: '2023-12-29', score: 95, credits: 4.1 },
  { date: '2023-12-30', score: 94, credits: 4.0 },
  { date: '2024-01-01', score: 94.5, credits: 4.3 },
];
