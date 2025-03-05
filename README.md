<p align="center">
  <img src="https://img.shields.io/badge/React-18.2.0-61DAFB?logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-4.9.5-3178C6?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-5.0.0-646CFF?logo=vite" alt="Vite" />
  <img src="https://img.shields.io/badge/TailwindCSS-3.4.1-38B2AC  alt="Tailwind CSS" />
</p>

<h1 align="center">🚀 FrameFinder Frontend</h1>
<p align="center"><strong>A blazing-fast, AI-powered video search app built with React, TypeScript, Vite, and Tailwind CSS</strong></p>

---

## 🌟 Overview

Welcome to **FrameFinder**, a sleek, modern frontend application that transforms how users search within videos! Powered by **React** and **TypeScript**, this project leverages **Vite** for lightning-fast builds and **Tailwind CSS** for a stunning, responsive UI. Designed with a focus on **UI/UX excellence**, FrameFinder combines smooth animations, intuitive workflows, and robust state management to deliver a delightful user experience.

With features like S3-powered video uploads, AI-driven clip search, and a polished interface, this project showcases cutting-edge frontend development skills—perfect for recruiters looking for talent in **React**, **TypeScript**, and modern web design!

---

## 🎨 Features

- **Video Upload with S3**: Seamlessly upload videos using pre-signed S3 URLs, with a dynamic **ProgressIndicator** for real-time feedback.
- **AI-Powered Search**: Search video content with precision, displaying clips with start/end timestamps using a robust backend integration.
- **Responsive Design**: Crafted with **Tailwind CSS** for a pixel-perfect, mobile-first layout that shines on any device.
- **Smooth Animations**: Powered by **Framer Motion** for fluid transitions and engaging micro-interactions.
- **Type-Safe Code**: Built with **TypeScript** for strong typing, reducing bugs and boosting maintainability.
- **Fast Development**: Utilizes **Vite** for instant HMR (Hot Module Replacement) and optimized builds.

---

## 🛠️ Tech Stack

- **React**: Component-based architecture with hooks (`useState`, `useEffect`) for efficient state management and lifecycle handling.
- **TypeScript**: Strict typing for props, state, and API responses, ensuring code reliability and scalability.
- **Vite**: Next-gen bundler for rapid development and production builds.
- **Tailwind CSS**: Utility-first CSS framework for rapid, maintainable styling with a custom dark theme.
- **Framer Motion**: Declarative animations for a polished, professional feel.
- **Lucide Icons**: Lightweight, customizable icons for a modern aesthetic.

---

## 🖼️ Project Structure

```plaintext
src/
├── components/
│   ├── Footer.tsx         # Sticky footer with minimal design
│   ├── ProgressIndicator.tsx # Animated progress bar with step messages
│   ├── SearchVideo.tsx    # Video search UI with playback controls
│   └── UploadVideo.tsx    # File upload with S3 integration
├── utils/
│   ├── fetchWithRetry.ts  # Utility for resilient API calls
│   └── uploadFileToS3.ts  # S3 upload logic with FormData
└── App.tsx                # Main app with conditional rendering
```
