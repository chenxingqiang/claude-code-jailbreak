#!/bin/bash
# Test script to verify Claude Code jailbreak is working
# This script tests various Claude CLI functionalities

echo "🔓 Testing Claude Code Jailbreak..."
echo "======================================"

# Source the jailbreak environment
source ../claude-env.sh

echo ""
echo "📋 Running Tests..."
echo "-------------------"

echo ""
echo "🧪 Test 1: Basic functionality"
echo "Command: claude --print 'Hello, jailbreak test!'"
claude --print "Hello, jailbreak test!"

echo ""
echo "🧪 Test 2: Math calculation"  
echo "Command: claude --print 'What is 15 * 7?'"
claude --print "What is 15 * 7?"

echo ""
echo "🧪 Test 3: Code generation"
echo "Command: claude --print 'Write a Python function to reverse a string'"
claude --print "Write a Python function to reverse a string"

echo ""
echo "🧪 Test 4: API endpoint verification"
echo "Checking environment variables:"
echo "ANTHROPIC_API_KEY: ${ANTHROPIC_API_KEY:0:10}..."
echo "ANTHROPIC_BASE_URL: $ANTHROPIC_BASE_URL"

echo ""
echo "✅ Jailbreak test completed!"
echo "If you see responses above, the jailbreak is working correctly."
