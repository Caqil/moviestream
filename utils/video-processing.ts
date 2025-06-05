import { spawn } from 'child_process';
import { promisify } from 'util';
import { exec } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

const execAsync = promisify(exec);

export interface VideoMetadata {
  duration: number; // in seconds
  resolution: string; // e.g., "1920x1080"
  width: number;
  height: number;
  format: string; // e.g., "mp4"
  codec: string; // e.g., "h264"
  audioCodec: string; // e.g., "aac"
  bitrate: number; // in kbps
  fps: number; // frames per second
  fileSize: number; // in bytes
  aspectRatio: string; // e.g., "16:9"
}

export interface ThumbnailOptions {
  timeOffset?: number; // Time in seconds
  width?: number;
  height?: number;
  quality?: number; // 1-31, lower is better
}

export interface ConversionOptions {
  format?: string;
  quality?: 'low' | 'medium' | 'high' | 'ultra';
  resolution?: string;
  bitrate?: number;
  fps?: number;
  codec?: string;
  audioCodec?: string;
  removeAudio?: boolean;
}

export interface HLSOptions {
  segmentDuration?: number; // seconds
  qualities?: Array<{
    resolution: string;
    bitrate: number;
    name: string;
  }>;
}

export class VideoProcessingUtils {
  private static ffmpegPath = process.env.FFMPEG_PATH || 'ffmpeg';
  private static ffprobePath = process.env.FFPROBE_PATH || 'ffprobe';

  // Check if FFmpeg is available
  static async isFFmpegAvailable(): Promise<boolean> {
    try {
      await execAsync(`${this.ffmpegPath} -version`);
      return true;
    } catch (error) {
      console.error('FFmpeg not found:', error);
      return false;
    }
  }

  // Extract comprehensive video metadata using ffprobe
  static async extractVideoMetadata(filePath: string): Promise<VideoMetadata> {
    try {
      const command = [
        this.ffprobePath,
        '-v', 'quiet',
        '-print_format', 'json',
        '-show_format',
        '-show_streams',
        filePath
      ].join(' ');

      const { stdout } = await execAsync(command);
      const metadata = JSON.parse(stdout);

      const videoStream = metadata.streams.find((stream: any) => stream.codec_type === 'video');
      const audioStream = metadata.streams.find((stream: any) => stream.codec_type === 'audio');

      if (!videoStream) {
        throw new Error('No video stream found');
      }

      const duration = parseFloat(metadata.format.duration);
      const width = videoStream.width;
      const height = videoStream.height;
      const resolution = `${width}x${height}`;
      const aspectRatio = this.calculateAspectRatio(width, height);
      const bitrate = Math.round(parseFloat(metadata.format.bit_rate) / 1000); // Convert to kbps
      const fps = eval(videoStream.r_frame_rate); // e.g., "30/1" becomes 30

      return {
        duration,
        resolution,
        width,
        height,
        format: metadata.format.format_name.split(',')[0], // Take first format
        codec: videoStream.codec_name,
        audioCodec: audioStream?.codec_name || 'none',
        bitrate,
        fps: Math.round(fps),
        fileSize: parseInt(metadata.format.size),
        aspectRatio
      };
    } catch (error) {
      console.error('Error extracting video metadata:', error);
      throw new Error('Failed to extract video metadata');
    }
  }

  // Generate video thumbnail
  static async generateThumbnail(
    inputPath: string,
    outputPath: string,
    options: ThumbnailOptions = {}
  ): Promise<void> {
    const {
      timeOffset = 30,
      width = 640,
      height = 360,
      quality = 2
    } = options;

    try {
      const command = [
        this.ffmpegPath,
        '-i', inputPath,
        '-ss', timeOffset.toString(),
        '-vframes', '1',
        '-vf', `scale=${width}:${height}`,
        '-q:v', quality.toString(),
        '-y', // Overwrite output file
        outputPath
      ];

      await this.runFFmpegCommand(command);
    } catch (error) {
      console.error('Error generating thumbnail:', error);
      throw new Error('Failed to generate thumbnail');
    }
  }

  // Generate multiple thumbnails for video preview
  static async generateMultipleThumbnails(
    inputPath: string,
    outputDir: string,
    count: number = 9
  ): Promise<string[]> {
    try {
      // First get video duration
      const metadata = await this.extractVideoMetadata(inputPath);
      const interval = metadata.duration / (count + 1);
      const thumbnails: string[] = [];

      for (let i = 1; i <= count; i++) {
        const timeOffset = interval * i;
        const outputPath = path.join(outputDir, `thumbnail_${i}.jpg`);
        
        await this.generateThumbnail(inputPath, outputPath, {
          timeOffset,
          width: 320,
          height: 180
        });
        
        thumbnails.push(outputPath);
      }

      return thumbnails;
    } catch (error) {
      console.error('Error generating multiple thumbnails:', error);
      throw new Error('Failed to generate thumbnails');
    }
  }

  // Convert video to different format/quality
  static async convertVideo(
    inputPath: string,
    outputPath: string,
    options: ConversionOptions = {}
  ): Promise<void> {
    const {
      format = 'mp4',
      quality = 'medium',
      resolution,
      bitrate,
      fps,
      codec = 'libx264',
      audioCodec = 'aac',
      removeAudio = false
    } = options;

    try {
      const command = [this.ffmpegPath, '-i', inputPath];

      // Video codec
      command.push('-c:v', codec);

      // Quality settings
      const qualitySettings = this.getQualitySettings(quality);
      command.push('-crf', qualitySettings.crf.toString());

      // Resolution
      if (resolution) {
        command.push('-vf', `scale=${resolution}`);
      }

      // Bitrate
      if (bitrate) {
        command.push('-b:v', `${bitrate}k`);
      }

      // FPS
      if (fps) {
        command.push('-r', fps.toString());
      }

      // Audio settings
      if (removeAudio) {
        command.push('-an'); // No audio
      } else {
        command.push('-c:a', audioCodec);
      }

      // Output format
      command.push('-f', format);
      command.push('-y', outputPath);

      await this.runFFmpegCommand(command);
    } catch (error) {
      console.error('Error converting video:', error);
      throw new Error('Failed to convert video');
    }
  }

  // Generate multiple quality versions
  static async generateMultipleQualities(
    inputPath: string,
    outputDir: string
  ): Promise<Record<string, string>> {
    const qualities = [
      { name: '480p', resolution: '854x480', bitrate: 1000 },
      { name: '720p', resolution: '1280x720', bitrate: 2500 },
      { name: '1080p', resolution: '1920x1080', bitrate: 5000 }
    ];

    const outputs: Record<string, string> = {};

    try {
      for (const quality of qualities) {
        const outputPath = path.join(outputDir, `video_${quality.name}.mp4`);
        
        await this.convertVideo(inputPath, outputPath, {
          resolution: quality.resolution,
          bitrate: quality.bitrate,
          quality: 'medium'
        });
        
        outputs[quality.name] = outputPath;
      }

      return outputs;
    } catch (error) {
      console.error('Error generating multiple qualities:', error);
      throw new Error('Failed to generate multiple quality versions');
    }
  }

  // Generate HLS playlist for adaptive streaming
  static async generateHLSPlaylist(
    inputPath: string,
    outputDir: string,
    options: HLSOptions = {}
  ): Promise<string> {
    const {
      segmentDuration = 10,
      qualities = [
        { resolution: '854x480', bitrate: 1000, name: '480p' },
        { resolution: '1280x720', bitrate: 2500, name: '720p' },
        { resolution: '1920x1080', bitrate: 5000, name: '1080p' }
      ]
    } = options;

    try {
      // Create master playlist
      let masterPlaylist = '#EXTM3U\n#EXT-X-VERSION:3\n';

      for (const quality of qualities) {
        const playlistName = `${quality.name}.m3u8`;
        const outputPath = path.join(outputDir, playlistName);
        
        // Generate individual quality playlist
        const command = [
          this.ffmpegPath,
          '-i', inputPath,
          '-c:v', 'libx264',
          '-c:a', 'aac',
          '-vf', `scale=${quality.resolution}`,
          '-b:v', `${quality.bitrate}k`,
          '-hls_time', segmentDuration.toString(),
          '-hls_playlist_type', 'vod',
          '-hls_segment_filename', path.join(outputDir, `${quality.name}_segment_%03d.ts`),
          '-y', outputPath
        ];

        await this.runFFmpegCommand(command);

        // Add to master playlist
        masterPlaylist += `#EXT-X-STREAM-INF:BANDWIDTH=${quality.bitrate * 1000},RESOLUTION=${quality.resolution}\n`;
        masterPlaylist += `${playlistName}\n`;
      }

      // Write master playlist
      const masterPlaylistPath = path.join(outputDir, 'master.m3u8');
      await fs.writeFile(masterPlaylistPath, masterPlaylist);

      return masterPlaylistPath;
    } catch (error) {
      console.error('Error generating HLS playlist:', error);
      throw new Error('Failed to generate HLS playlist');
    }
  }

  // Extract audio from video
  static async extractAudio(
    inputPath: string,
    outputPath: string,
    audioCodec: string = 'mp3'
  ): Promise<void> {
    try {
      const command = [
        this.ffmpegPath,
        '-i', inputPath,
        '-vn', // No video
        '-acodec', audioCodec === 'mp3' ? 'libmp3lame' : audioCodec,
        '-y', outputPath
      ];

      await this.runFFmpegCommand(command);
    } catch (error) {
      console.error('Error extracting audio:', error);
      throw new Error('Failed to extract audio');
    }
  }

  // Validate video file
  static async validateVideoFile(filePath: string): Promise<boolean> {
    try {
      const metadata = await this.extractVideoMetadata(filePath);
      
      // Check constraints
      const maxDuration = 4 * 60 * 60; // 4 hours
      const maxFileSize = 5 * 1024 * 1024 * 1024; // 5GB
      const minDuration = 30; // 30 seconds
      
      return (
        metadata.duration >= minDuration &&
        metadata.duration <= maxDuration &&
        metadata.fileSize <= maxFileSize &&
        metadata.width >= 480 && // Minimum resolution
        metadata.height >= 360
      );
    } catch (error) {
      console.error('Error validating video file:', error);
      return false;
    }
  }

  // Calculate video hash for duplicate detection
  static async calculateVideoHash(filePath: string): Promise<string> {
    try {
      const buffer = await fs.readFile(filePath);
      return crypto.createHash('md5').update(buffer).digest('hex');
    } catch (error) {
      console.error('Error calculating video hash:', error);
      throw new Error('Failed to calculate video hash');
    }
  }

  // Create video preview/trailer
  static async createPreview(
    inputPath: string,
    outputPath: string,
    duration: number = 30,
    startOffset: number = 60
  ): Promise<void> {
    try {
      const command = [
        this.ffmpegPath,
        '-i', inputPath,
        '-ss', startOffset.toString(),
        '-t', duration.toString(),
        '-c:v', 'libx264',
        '-c:a', 'aac',
        '-y', outputPath
      ];

      await this.runFFmpegCommand(command);
    } catch (error) {
      console.error('Error creating preview:', error);
      throw new Error('Failed to create preview');
    }
  }

  // Compress video for web streaming
  static async compressForWeb(inputPath: string, outputPath: string): Promise<void> {
    try {
      const command = [
        this.ffmpegPath,
        '-i', inputPath,
        '-c:v', 'libx264',
        '-preset', 'slow',
        '-crf', '23',
        '-c:a', 'aac',
        '-b:a', '128k',
        '-movflags', '+faststart', // Optimize for web streaming
        '-y', outputPath
      ];

      await this.runFFmpegCommand(command);
    } catch (error) {
      console.error('Error compressing video:', error);
      throw new Error('Failed to compress video for web');
    }
  }

  // Private helper methods
  private static async runFFmpegCommand(command: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
      const process = spawn(command[0], command.slice(1));
      let stderr = '';

      process.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      process.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`FFmpeg process exited with code ${code}: ${stderr}`));
        }
      });

      process.on('error', (error) => {
        reject(error);
      });
    });
  }

  private static getQualitySettings(quality: string): { crf: number } {
    const settings = {
      low: { crf: 28 },
      medium: { crf: 23 },
      high: { crf: 18 },
      ultra: { crf: 15 }
    };
    return settings[quality as keyof typeof settings] || settings.medium;
  }

  private static calculateAspectRatio(width: number, height: number): string {
    const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
    const divisor = gcd(width, height);
    return `${width / divisor}:${height / divisor}`;
  }

  // Get video info without processing
  static async getVideoInfo(filePath: string): Promise<{
    isValid: boolean;
    metadata?: VideoMetadata;
    error?: string;
  }> {
    try {
      const metadata = await this.extractVideoMetadata(filePath);
      const isValid = await this.validateVideoFile(filePath);
      
      return {
        isValid,
        metadata
      };
    } catch (error) {
      return {
        isValid: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Estimate processing time
  static estimateProcessingTime(
    duration: number,
    operation: 'thumbnail' | 'convert' | 'hls' | 'compress'
  ): number {
    // Rough estimates in seconds (will vary based on hardware)
    const multipliers = {
      thumbnail: 0.1, // Very fast
      convert: 0.5, // Depends on quality settings
      hls: 1.5, // Multiple quality versions
      compress: 0.3 // Fast compression
    };
    
    return Math.ceil(duration * multipliers[operation]);
  }
}