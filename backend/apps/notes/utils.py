"""
Helper utilities for notes management
"""

import re
import math


def calculate_reading_time(content: str) -> int:
    """
    Calculate estimated reading time in minutes
    
    Args:
        content: Text content
    
    Returns:
        int: Reading time in minutes
    """
    if not content:
        return 0
    
    # Average reading speed: 200 words per minute
    word_count = len(content.split())
    reading_time = word_count / 200
    
    # Round up to nearest minute
    return math.ceil(reading_time)


def extract_headings(markdown_content: str) -> list:
    """
    Extract all headings from markdown
    
    Args:
        markdown_content: Markdown text
    
    Returns:
        list: List of headings with levels
            [{'level': 1, 'text': 'Heading'}, ...]
    """
    if not markdown_content:
        return []
    
    headings = []
    # Match markdown headings (# ## ### etc.)
    pattern = r'^(#{1,6})\s+(.+)$'
    
    for line in markdown_content.split('\n'):
        match = re.match(pattern, line.strip())
        if match:
            level = len(match.group(1))  # Count # symbols
            text = match.group(2).strip()
            # Remove markdown formatting from heading text
            text = re.sub(r'[*_`]', '', text)
            headings.append({
                'level': level,
                'text': text
            })
    
    return headings


def count_words(text: str) -> int:
    """
    Count words in text (handles markdown)
    
    Args:
        text: Text content (may contain markdown)
    
    Returns:
        int: Word count
    """
    if not text:
        return 0
    
    # Remove markdown symbols
    clean_text = re.sub(r'[#*_`\[\]()]', '', text)
    
    # Split on whitespace and count non-empty tokens
    words = [word for word in clean_text.split() if word.strip()]
    
    return len(words)


def markdown_to_plain_text(markdown: str) -> str:
    """
    Convert markdown to plain text
    
    Args:
        markdown: Markdown formatted text
    
    Returns:
        str: Plain text without markdown formatting
    """
    if not markdown:
        return ''
    
    # Remove headers (#)
    text = re.sub(r'^#{1,6}\s+', '', markdown, flags=re.MULTILINE)
    
    # Remove bold (**text** or __text__)
    text = re.sub(r'\*\*(.+?)\*\*', r'\1', text)
    text = re.sub(r'__(.+?)__', r'\1', text)
    
    # Remove italic (*text* or _text_)
    text = re.sub(r'\*(.+?)\*', r'\1', text)
    text = re.sub(r'_(.+?)_', r'\1', text)
    
    # Remove inline code (`code`)
    text = re.sub(r'`(.+?)`', r'\1', text)
    
    # Remove links [text](url)
    text = re.sub(r'\[(.+?)\]\(.+?\)', r'\1', text)
    
    # Remove images ![alt](url)
    text = re.sub(r'!\[.+?\]\(.+?\)', '', text)
    
    # Remove blockquotes (>)
    text = re.sub(r'^>\s+', '', text, flags=re.MULTILINE)
    
    # Remove list markers (- * +)
    text = re.sub(r'^[\-\*\+]\s+', '', text, flags=re.MULTILINE)
    
    # Remove numbered lists (1. 2. etc.)
    text = re.sub(r'^\d+\.\s+', '', text, flags=re.MULTILINE)
    
    return text.strip()


def generate_table_of_contents(markdown_content: str) -> str:
    """
    Generate a table of contents from markdown headings
    
    Args:
        markdown_content: Markdown text
    
    Returns:
        str: Markdown formatted table of contents
    """
    headings = extract_headings(markdown_content)
    
    if not headings:
        return ''
    
    toc_lines = ['## Table of Contents\n']
    
    for heading in headings:
        # Skip level 1 headings (usually the title)
        if heading['level'] == 1:
            continue
        
        # Create indentation based on level
        indent = '  ' * (heading['level'] - 2)
        
        # Create anchor link (lowercase, replace spaces with hyphens)
        anchor = heading['text'].lower().replace(' ', '-')
        anchor = re.sub(r'[^\w\-]', '', anchor)  # Remove special chars
        
        # Add to TOC
        toc_lines.append(f"{indent}- [{heading['text']}](#{anchor})")
    
    return '\n'.join(toc_lines)
