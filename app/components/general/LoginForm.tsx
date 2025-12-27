import React from 'react';

export function LoginForm() {
  return (
    <div className="flex flex-col gap-4 p-4 rounded-md bg-gray-800">
      <h2 className="text-xl font-bold text-white">Login</h2>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-300" htmlFor="email">
          Email
        </label>
        <input
          className="px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          id="email"
          type="email"
          placeholder="you@example.com"
        />
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-300" htmlFor="password">
          Password
        </label>
        <input
          className="px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          id="password"
          type="password"
        />
      </div>
      <button className="px-4 py-2 font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700">
        Sign In
      </button>
      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-600" />
        </div>
        <div className="relative px-2 text-sm text-gray-400 bg-gray-800">
          Or continue with
        </div>
      </div>
      <button className="flex items-center justify-center gap-2 px-4 py-2 font-bold text-white bg-gray-700 border border-gray-600 rounded-md hover:bg-gray-600">
        <span>Sign in with Google</span>
      </button>
    </div>
  );
}
