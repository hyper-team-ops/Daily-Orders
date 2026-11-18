import {
  Headphones,
  Laptop,
  Layers,
  LayoutGrid,
  type LucideIcon,
} from 'lucide-react';
import { SERVICE_TYPES, type ServiceType } from '@/types/order';

export const SERVICE_OPTIONS = SERVICE_TYPES;

export interface ServiceStyleConfig {
  icon: LucideIcon;
  bg: string;
  text: string;
  border: string;
  activeBg: string;
  cardBg: string;
  cardSelected: string;
  iconColor: string;
}

export const SERVICE_STYLE: Record<ServiceType, ServiceStyleConfig> = {
  برامج: {
    icon: LayoutGrid,
    bg: 'bg-[#FCEBEB]',
    text: 'text-[#9F2D3A]',
    border: 'border-[#E8B7BC]',
    activeBg: 'bg-[#2B3439] text-[#E2A425] border-[#2B3439]',
    cardBg: 'bg-[#FDF4F4] border-[#EDD1D4] text-[#9F2D3A]',
    cardSelected:
      'bg-[#FCEBEB] border-[#D27728] text-[#8A222E] ring-2 ring-[#D27728]/25',
    iconColor: 'text-[#B53A48]',
  },
  فرمتة: {
    icon: Laptop,
    bg: 'bg-[#FBECE0]',
    text: 'text-[#A65314]',
    border: 'border-[#EBC3A4]',
    activeBg: 'bg-[#D27728] text-white border-[#D27728]',
    cardBg: 'bg-[#FEF5EE] border-[#F0D3BC] text-[#A65314]',
    cardSelected:
      'bg-[#FBECE0] border-[#D27728] text-[#8E430D] ring-2 ring-[#D27728]/25',
    iconColor: 'text-[#D27728]',
  },
  كورسات: {
    icon: Layers,
    bg: 'bg-[#FDF3DC]',
    text: 'text-[#8B600D]',
    border: 'border-[#EBD293]',
    activeBg: 'bg-[#E2A425] text-[#2B3439] border-[#E2A425]',
    cardBg: 'bg-[#FEF9EC] border-[#F0DFAF] text-[#8B600D]',
    cardSelected:
      'bg-[#FDF3DC] border-[#E2A425] text-[#704C07] ring-2 ring-[#E2A425]/30',
    iconColor: 'text-[#C88D18]',
  },
  'حل مشكلة | استشارة': {
    icon: Headphones,
    bg: 'bg-[#EAF3F8]',
    text: 'text-[#2B4E63]',
    border: 'border-[#C1DBE8]',
    activeBg: 'bg-[#2B3439] text-[#F7E8D2] border-[#E2A425]',
    cardBg: 'bg-[#F3F8FB] border-[#D2E4EE] text-[#2B4E63]',
    cardSelected:
      'bg-[#EAF3F8] border-[#2B3439] text-[#1F3C4E] ring-2 ring-[#2B3439]/20',
    iconColor: 'text-[#316380]',
  },
};
