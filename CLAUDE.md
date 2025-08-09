# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
This is a configuration setup repository that enables using Claude CLI with Moonshot AI's API instead of Anthropic's API, bypassing organization registration requirements.

## Setup Commands
```bash
# Initial setup
source claude-env.sh

# Test the configuration
claude --print "Hello, world!"

# Interactive mode
claude

# Non-interactive with specific model
claude --print --model sonnet "Your prompt here"
```

## Environment Configuration
Key environment variables set by `claude-env.sh`:
- `ANTHROPIC_API_KEY`: Moonshot API key (format: sk-...)
- `ANTHROPIC_BASE_URL`: https://api.moonshot.cn/anthropic
- `MOONSHOT_API_KEY`: Alternative API key variable
- `MOONSHOT_BASE_URL`: Alternative URL variable

## Permanent Setup
Add to shell profile for persistent configuration:
```bash
echo 'source /path/to/claude-env.sh' >> ~/.zshrc
```

## Architecture
- **Type**: Configuration bridge (not traditional software)
- **Purpose**: Redirect Claude CLI API calls from Anthropic to Moonshot AI
- **Structure**: Simple bash script + documentation
- **Dependencies**: Claude CLI v1.0.72+, valid Moonshot AI API key

## Files
- `claude-env.sh`: Environment variable configuration
- `README.md`: Complete setup and usage guide
- `target.md`: Original requirement specification