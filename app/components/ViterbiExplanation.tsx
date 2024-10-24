import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft, BookOpen } from "lucide-react";

interface ExplanationStep {
  title: string;
  content: string;
  example?: string;
}

const explanationSteps: ExplanationStep[] = [
  {
    title: "1. Word Selection",
    content: "Select words from the available options to create a sequence. Each word will be analyzed for its most likely part of speech based on context.",
    example: "Example: Clicking 'book' adds it to your sequence."
  },
  {
    title: "2. Hidden States",
    content: "The algorithm considers different possible parts of speech (noun, verb, adjective) for each word, treating them as hidden states.",
    example: "Example: 'book' could be either a noun (\"a book\") or a verb (\"to book a ticket\")."
  },
  {
    title: "3. Transition Probabilities",
    content: "The algorithm analyzes how likely one part of speech is to follow another, based on typical English grammar patterns.",
    example: "Example: An article (\"the\") is more likely to be followed by a noun than a verb."
  },
  {
    title: "4. Emission Probabilities",
    content: "For each word, the algorithm considers how likely it is to be each part of speech, based on common usage.",
    example: "Example: \"the\" is most likely to be an article, while \"book\" could be either a noun or verb."
  },
  {
    title: "5. Viterbi Path",
    content: "The algorithm finds the most probable sequence of parts of speech by considering both transition and emission probabilities together.",
    example: "Example: In \"the book\", \"book\" is more likely to be a noun because it follows an article."
  }
];

interface ViterbiExplanationProps {
  currentSequence: string[];
  className?: string;
}

export function ViterbiExplanation({ currentSequence, className = "" }: ViterbiExplanationProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isExpanded, setIsExpanded] = useState(true);

  const nextStep = () => {
    setCurrentStep((prev) => (prev < explanationSteps.length - 1 ? prev + 1 : prev));
  };

  const prevStep = () => {
    setCurrentStep((prev) => (prev > 0 ? prev - 1 : prev));
  };

  if (!isExpanded) {
    return (
      <Button
        variant="outline"
        onClick={() => setIsExpanded(true)}
        className="fixed bottom-4 right-4 bg-slate-800/90 text-white hover:bg-slate-700 z-10"
      >
        <BookOpen className="w-4 h-4 mr-2" />
        Show Explanation
      </Button>
    );
  }

  return (
    <Card className={`bg-slate-800/50 border-slate-700 backdrop-blur-sm transition-all duration-300 ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-white text-xl">How It Works</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(false)}
          className="text-slate-400 hover:text-white"
        >
          Minimize
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="min-h-[200px] bg-slate-900/50 rounded-lg p-4 space-y-4">
          <h3 className="text-lg font-semibold text-blue-400">
            {explanationSteps[currentStep].title}
          </h3>
          <p className="text-slate-300">
            {explanationSteps[currentStep].content}
          </p>
          {explanationSteps[currentStep].example && (
            <p className="text-sm text-slate-400 italic">
              {explanationSteps[currentStep].example}
            </p>
          )}
        </div>
        
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
            className="text-slate-400 hover:text-white"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </Button>
          <span className="text-slate-400">
            {currentStep + 1} / {explanationSteps.length}
          </span>
          <Button
            variant="outline"
            onClick={nextStep}
            disabled={currentStep === explanationSteps.length - 1}
            className="text-slate-400 hover:text-white"
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        {currentSequence.length > 0 && (
          <div className="mt-4 p-4 bg-slate-900/50 rounded-lg">
            <p className="text-sm text-slate-400 mb-2">Current Sequence:</p>
            <div className="flex flex-wrap gap-2">
              {currentSequence.map((word, idx) => (
                <span key={idx} className="px-2 py-1 bg-blue-500/20 rounded text-blue-300">
                  {word}
                </span>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}