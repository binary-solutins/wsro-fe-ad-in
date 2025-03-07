import { 
    LayoutDashboard, 
    Trophy, 
    Users, 
    CreditCard, 
    ScrollText, 
    Settings,
    LucideIcon,
    FunctionSquareIcon
  } from 'lucide-react';
  
  interface NavigationItem {
    to: string;
    icon: LucideIcon;
    text: string;
  }
  
  export const navigationItems: NavigationItem[] = [
    { to: '/', icon: LayoutDashboard, text: 'Dashboard' },
    { to: '/events', icon: FunctionSquareIcon, text: 'Events' },
    { to: '/competitions', icon: Trophy, text: 'Competitions' },
    { to: '/registrations', icon: Users, text: 'Registrations' },
    { to: '/certificates', icon: ScrollText, text: 'Certificates' },
    { to: '/inquery', icon: ScrollText, text: 'Inquery' },
    { to: '/settings', icon: Settings, text: 'Settings' },
  ];