# Key Layout and UX Patterns from Lovable's Implementation

## Content Selection Interface Layout

### Overall Structure
```tsx
<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
  {/* Search and Filters Section */}
  <div className="mb-8">
    <h2 className="text-xl font-semibold text-gray-900 mb-4">Choose your learning content</h2>
    
    {/* Search Bar with Icon */}
    <div className="relative mb-4">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <SearchIcon />
      </div>
      <input className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
    </div>

    {/* Topic Filter Chips */}
    <div className="flex flex-wrap gap-2">
      {topics.map(topic => (
        <button className={`px-3 py-1.5 text-sm font-medium rounded-full border transition-all duration-200`}>
          {topic}
        </button>
      ))}
    </div>
  </div>

  {/* Content Grid */}
  <div className="grid gap-4 mb-8">
    {/* Content cards here */}
  </div>

  {/* Sticky Bottom Selection Summary */}
  {selectedContent.length > 0 && (
    <div className="sticky bottom-0 bg-white border-t border-gray-200 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">
              {selectedContent.length} item{selectedContent.length !== 1 ? 's' : ''} selected
            </p>
            <p className="text-sm text-gray-600">
              {getTotalQuestions()} questions • ~{getEstimatedTime().toFixed(1)}h estimated
            </p>
          </div>
          <Button variant="primary" size="lg" onClick={() => onContinue(selectedContent)}>
            Continue
          </Button>
        </div>
      </div>
    </div>
  )}
</div>
```

### Individual Content Card Structure
```tsx
<Card
  onClick={() => toggleContentSelection(item.id)}
  selected={selectedContent.includes(item.id)}
  className="p-6"
>
  <div className="flex items-start justify-between">
    <div className="flex-1 min-w-0">
      {/* Content Type + Title */}
      <div className="flex items-center space-x-2 mb-2">
        <span className="text-lg">{contentTypeIcon}</span>
        <h3 className="text-lg font-semibold text-gray-900 truncate">
          {item.title}
        </h3>
      </div>
      
      {/* Source */}
      <p className="text-gray-600 mb-3">{item.source}</p>
      
      {/* Metadata */}
      <div className="flex flex-wrap items-center gap-3 mb-3">
        <span className="text-sm text-gray-500">
          {item.duration_hours}h • {item.questions} questions
        </span>
        {item.topics.map(topic => (
          <Badge key={topic} variant={topicColors[topic]} size="sm">
            {topic}
          </Badge>
        ))}
      </div>
      
      {/* Progress Bar */}
      <div className="flex items-center space-x-3">
        <div className="flex-1">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-gray-600">Progress</span>
            <span className="font-medium text-gray-900">
              {item.mastery_percentage}%
            </span>
          </div>
          <ProgressBar progress={item.mastery_percentage} size="sm" />
        </div>
      </div>
    </div>
    
    {/* Selection Indicator */}
    <div className="ml-4 flex-shrink-0">
      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
        selectedContent.includes(item.id)
          ? 'bg-blue-600 border-blue-600'
          : 'border-gray-300'
      }`}>
        {selectedContent.includes(item.id) && (
          <CheckIcon className="w-4 h-4 text-white" />
        )}
      </div>
    </div>
  </div>
</Card>
```

## Key UX Improvements

### 1. Clear Information Hierarchy
- **Large, prominent titles** for content
- **Secondary metadata** (duration, questions) in smaller text
- **Visual separation** between different types of information

### 2. Professional Selection States
- **Blue border + shadow** for selected cards
- **Clean checkmark** in circular indicator
- **Smooth transitions** for all state changes

### 3. Sticky Bottom Actions
- **Summary information** (count, estimated time)
- **Clear primary action** (Continue button)
- **No accidental navigation** - explicit user intent required

### 4. Mobile-Optimized Touch Targets
- **Minimum 44px** for all interactive elements
- **Proper spacing** between touch targets
- **Thumb-friendly** placement of primary actions

### 5. Clean Visual Design
- **Consistent spacing** using Tailwind scale
- **Professional color palette** (blues, grays, greens)
- **Subtle shadows and borders** for depth without distraction
- **Clean typography hierarchy** with proper font weights and sizes
