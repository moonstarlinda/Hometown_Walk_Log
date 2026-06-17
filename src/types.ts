/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Base {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  location: string;
  coverImage: string;
}

export interface WalkLog {
  id: string;
  baseId: string;
  date: string;
  weather: 'sunny' | 'cloudy' | 'rainy' | 'overcast' | 'windy';
  weatherText: string; // e.g. "多云转晴", "微雨"
  tags: string[]; // e.g. ["水质清澈", "野鸭出没", "白云诡谲"]
  photos?: string[];
  content: string;
}
