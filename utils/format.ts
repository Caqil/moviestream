export class FormatUtils {
    // Date formatting
    static formatDate(date: Date | string, format: 'short' | 'long' | 'relative' = 'short'): string {
      const d = new Date(date);
      
      if (format === 'relative') {
        return this.getRelativeTime(d);
      }
      
      if (format === 'long') {
        return d.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
      
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  
    static getRelativeTime(date: Date): string {
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
      
      if (diffInSeconds < 60) return 'Just now';
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
      if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
      if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
      return `${Math.floor(diffInSeconds / 31536000)} years ago`;
    }
  
    // Duration formatting
    static formatDuration(minutes: number): string {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      
      if (hours === 0) {
        return `${mins}m`;
      }
      
      return `${hours}h ${mins}m`;
    }
  
    static formatVideoDuration(seconds: number): string {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const remainingSeconds = seconds % 60;
      
      if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
      }
      
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
  
    // File size formatting
    static formatFileSize(bytes: number): string {
      const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
      if (bytes === 0) return '0 Bytes';
      
      const i = Math.floor(Math.log(bytes) / Math.log(1024));
      return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    }
  
    // Currency formatting
    static formatCurrency(amount: number, currency: string = 'USD'): string {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
      }).format(amount);
    }
  
    // Number formatting
    static formatNumber(num: number): string {
      if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
      }
      if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
      }
      return num.toString();
    }
  
    // Device type formatting
    static formatDeviceType(type: string): string {
      const types: Record<string, string> = {
        web: 'Web Browser',
        mobile: 'Mobile Device',
        tablet: 'Tablet',
        tv: 'Smart TV',
        desktop: 'Desktop App',
        other: 'Other Device'
      };
      return types[type] || type;
    }
  
    // Quality badge formatting
    static getQualityBadge(quality: string): { text: string; color: string } {
      const qualities: Record<string, { text: string; color: string }> = {
        'HD': { text: 'HD', color: 'bg-blue-100 text-blue-800' },
        'Full HD': { text: 'FHD', color: 'bg-green-100 text-green-800' },
        '4K': { text: '4K', color: 'bg-purple-100 text-purple-800' },
        'auto': { text: 'AUTO', color: 'bg-gray-100 text-gray-800' }
      };
      return qualities[quality] || { text: quality, color: 'bg-gray-100 text-gray-800' };
    }
  
    // Subscription status formatting
    static getStatusBadge(status: string): { text: string; color: string } {
      const statuses: Record<string, { text: string; color: string }> = {
        active: { text: 'Active', color: 'bg-green-100 text-green-800' },
        canceled: { text: 'Canceled', color: 'bg-red-100 text-red-800' },
        expired: { text: 'Expired', color: 'bg-gray-100 text-gray-800' },
        trial: { text: 'Trial', color: 'bg-yellow-100 text-yellow-800' },
        pending: { text: 'Pending', color: 'bg-blue-100 text-blue-800' },
        blocked: { text: 'Blocked', color: 'bg-red-100 text-red-800' },
        verified: { text: 'Verified', color: 'bg-green-100 text-green-800' },
        unverified: { text: 'Unverified', color: 'bg-orange-100 text-orange-800' }
      };
      return statuses[status] || { text: status, color: 'bg-gray-100 text-gray-800' };
    }
  
    // Device status badges
    static getDeviceStatusBadge(isActive: boolean, isVerified: boolean, isBlocked: boolean): { text: string; color: string } {
      if (isBlocked) return { text: 'Blocked', color: 'bg-red-100 text-red-800' };
      if (!isVerified) return { text: 'Unverified', color: 'bg-orange-100 text-orange-800' };
      if (isActive) return { text: 'Active', color: 'bg-green-100 text-green-800' };
      return { text: 'Inactive', color: 'bg-gray-100 text-gray-800' };
    }
  
    // Progress formatting
    static formatProgress(progress: number): string {
      return `${Math.round(progress)}%`;
    }
  
    // Bandwidth formatting
    static formatBandwidth(kbps: number): string {
      if (kbps >= 1000) {
        return `${(kbps / 1000).toFixed(1)} Mbps`;
      }
      return `${kbps} Kbps`;
    }
  
    // Resolution formatting
    static formatResolution(resolution: string): string {
      const resolutions: Record<string, string> = {
        '1920x1080': '1080p (Full HD)',
        '1280x720': '720p (HD)',
        '854x480': '480p (SD)',
        '3840x2160': '2160p (4K)',
        '2560x1440': '1440p (2K)',
        'auto': 'Auto Quality'
      };
      return resolutions[resolution] || resolution;
    }
  
    // URL slug formatting
    static createSlug(text: string): string {
      return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
        .trim();
    }
  
    // Text truncation
    static truncateText(text: string, maxLength: number): string {
      if (text.length <= maxLength) return text;
      return text.substring(0, maxLength) + '...';
    }
  
    // Movie rating formatting
    static formatRating(rating: number): string {
      return `${rating.toFixed(1)}/10`;
    }
  
    // Age rating formatting
    static formatAgeRating(rating: string): { text: string; color: string } {
      const ratings: Record<string, { text: string; color: string }> = {
        'G': { text: 'G', color: 'bg-green-100 text-green-800' },
        'PG': { text: 'PG', color: 'bg-blue-100 text-blue-800' },
        'PG-13': { text: 'PG-13', color: 'bg-yellow-100 text-yellow-800' },
        'R': { text: 'R', color: 'bg-orange-100 text-orange-800' },
        'NC-17': { text: 'NC-17', color: 'bg-red-100 text-red-800' },
        'NR': { text: 'Not Rated', color: 'bg-gray-100 text-gray-800' }
      };
      return ratings[rating] || { text: rating, color: 'bg-gray-100 text-gray-800' };
    }
  
    // Capitalize first letter
    static capitalize(text: string): string {
      return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    }
  
    // Format list with proper grammar
    static formatList(items: string[]): string {
      if (items.length === 0) return '';
      if (items.length === 1) return items[0];
      if (items.length === 2) return `${items[0]} and ${items[1]}`;
      
      const allButLast = items.slice(0, -1).join(', ');
      const last = items[items.length - 1];
      return `${allButLast}, and ${last}`;
    }
  
    // Format percentage change
    static formatPercentageChange(current: number, previous: number): { 
      value: string; 
      isPositive: boolean; 
      color: string 
    } {
      if (previous === 0) {
        return { 
          value: 'N/A', 
          isPositive: true, 
          color: 'text-gray-500' 
        };
      }
  
      const change = ((current - previous) / previous) * 100;
      const isPositive = change >= 0;
      
      return {
        value: `${isPositive ? '+' : ''}${change.toFixed(1)}%`,
        isPositive,
        color: isPositive ? 'text-green-600' : 'text-red-600'
      };
    }
  
    // Format subscription interval
    static formatSubscriptionInterval(interval: string, intervalCount: number = 1): string {
      const intervals: Record<string, string> = {
        month: intervalCount === 1 ? 'Monthly' : `Every ${intervalCount} months`,
        year: intervalCount === 1 ? 'Yearly' : `Every ${intervalCount} years`,
        week: intervalCount === 1 ? 'Weekly' : `Every ${intervalCount} weeks`,
        day: intervalCount === 1 ? 'Daily' : `Every ${intervalCount} days`
      };
      return intervals[interval] || `Every ${intervalCount} ${interval}(s)`;
    }
  
    // Format trial period
    static formatTrialPeriod(days: number): string {
      if (days === 0) return 'No trial';
      if (days === 1) return '1 day trial';
      if (days === 7) return '1 week trial';
      if (days === 14) return '2 weeks trial';
      if (days === 30) return '1 month trial';
      return `${days} days trial`;
    }
  
    // Format content age
    static formatContentAge(releaseDate: Date): string {
      const now = new Date();
      const diffInYears = now.getFullYear() - releaseDate.getFullYear();
      
      if (diffInYears === 0) return 'This year';
      if (diffInYears === 1) return 'Last year';
      return `${diffInYears} years ago`;
    }
  }