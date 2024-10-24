import { json, type ActionFunctionArgs } from "@remix-run/node";
import { useActionData, useNavigation, Form, useSubmit } from "@remix-run/react";
import { useState, useCallback } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/ui/tooltip";
import { ArrowRight, Brain, RefreshCw, Trash2, HelpCircle } from "lucide-react";
import { observations } from "../types/viterbi.types";
import { computeViterbi } from "../utils/viterbi.server";
import { ViterbiExplanation } from "~/components/ViterbiExplanation";

interface ActionData {
  sequence: string[];
  bestPath: (string | null)[];
  error?: string;
}

// Word explanations mapping
const wordExplanations = {
  cat: {
    Noun: "A cat is a small domesticated carnivorous mammal. Here, 'cat' is a noun because it refers to a person, place, animal, or thing.",
    Verb: "While uncommon, 'cat' could theoretically be used as a verb meaning 'to vomit' (informal), but this is not the primary usage.",
    Adjective: "Not typically used as an adjective."
  },
  dog: {
    Noun: "A dog is a domesticated carnivorous mammal. Here, 'dog' is a noun because it refers to a person, place, animal, or thing.",
    Verb: "While 'dog' can be used as a verb meaning 'to follow persistently', this is not its primary usage.",
    Adjective: "Not typically used as an adjective."
  },
  run: {
    Noun: "'Run' can be used as a noun meaning 'a continuous series' or 'a scoring play in baseball'.",
    Verb: "Most commonly used as a verb meaning 'to move swiftly on foot'. This is its primary usage in most contexts.",
    Adjective: "Not used as an adjective."
  },
  jump: {
    Noun: "'Jump' can be used as a noun meaning 'a leap or hop'.",
    Verb: "Most commonly used as a verb meaning 'to spring off the ground'. This is its primary usage in most contexts.",
    Adjective: "Not used as an adjective."
  },
  fast: {
    Noun: "'Fast' can be used as a noun meaning 'a period of abstaining from food'.",
    Verb: "Can be used as a verb meaning 'to abstain from food', but this is uncommon.",
    Adjective: "Most commonly used as an adjective meaning 'moving or capable of moving at high speed'. This is its primary usage."
  },
  big: {
    Noun: "Not used as a noun.",
    Verb: "Not used as a verb.",
    Adjective: "Used as an adjective meaning 'of considerable size or extent'. This is its primary and only standard usage."
  }
};

export async function action({ request }: ActionFunctionArgs) {
  try {
    const formData = await request.formData();
    const sequenceString = formData.get("sequence")?.toString() || "";
    const action = formData.get("action")?.toString();

    if (action === "reset") {
      return json<ActionData>({ sequence: [], bestPath: [] });
    }
    
    if (!sequenceString) {
      return json<ActionData>({ sequence: [], bestPath: [] });
    }
    
    const sequence = sequenceString.split(",").filter(Boolean);
    
    if (!sequence.every(word => observations.includes(word))) {
      return json<ActionData>({ 
        sequence: [], 
        bestPath: [],
        error: "Invalid sequence: contains unknown words" 
      });
    }

    const result = await computeViterbi(sequence);
    return json<ActionData>({ sequence, bestPath: result.bestPath });
    
  } catch (error) {
    console.error("Action error:", error);
    return json<ActionData>({ 
      sequence: [], 
      bestPath: [],
      error: "An error occurred while processing the sequence" 
    }, { status: 400 });
  }
}

export default function Index() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const submit = useSubmit();
  const [localSequence, setLocalSequence] = useState<string[]>([]);
  
  const isProcessing = navigation.state === "submitting";

  const addWord = useCallback((word: string) => {
    setLocalSequence(prev => [...prev, word]);
  }, []);

  const reset = useCallback(() => {
    setLocalSequence([]);
    const formData = new FormData();
    formData.append("action", "reset");
    submit(formData, { method: "post" });
  }, [submit]);

  const PartOfSpeechTooltip = ({ word, partOfSpeech }: { word: string; partOfSpeech: string }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="ghost" 
            className="h-5 w-5 p-0 hover:bg-transparent"
          >
            <HelpCircle className="h-4 w-4 text-blue-400" />
          </Button>
        </TooltipTrigger>
        <TooltipContent 
          className="max-w-xs bg-slate-900 border-slate-700 text-white p-3"
        >
          <div className="space-y-2">
            <p className="font-semibold text-blue-400">
              {word} as {partOfSpeech.toLowerCase()}:
            </p>
            <p className="text-sm text-slate-300">
              {wordExplanations[word][partOfSpeech]}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4 md:p-8 animate-gradient-x">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Card */}
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm transition-all hover:scale-[1.01] duration-300">
          <CardHeader>
            <CardTitle className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
              <Brain className="h-6 w-6 md:h-8 md:w-8 text-blue-400 animate-float" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                Viterbi Algorithm Visualizer
              </span>
            </CardTitle>
            <CardDescription className="text-slate-300">
              Interactive demonstration of the Viterbi algorithm for parts-of-speech tagging
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Word Selection Card */}
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm transition-transform duration-300 ease-in-out">
          <CardHeader>
            <CardTitle className="text-white text-xl">Available Words</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {observations.map((word) => (
                <Button
                  key={word}
                  variant="secondary"
                  onClick={() => addWord(word)}
                  className="transform transition-all duration-200 hover:scale-105 hover:bg-blue-500 hover:text-white active:scale-95 animate-fadeIn"
                >
                  {word}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Controls and Current Sequence */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white text-xl">Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Form method="post" className="space-y-4">
                <input type="hidden" name="sequence" value={localSequence.join(",")} />
                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-500 transition-all duration-300 animate-pulse-glow"
                  disabled={localSequence.length === 0 || isProcessing}
                >
                  {isProcessing ? (
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Processing...
                    </div>
                  ) : (
                    "Process Sequence"
                  )}
                </Button>
              </Form>
              <Button 
                variant="destructive" 
                className="w-full group transition-all duration-300"
                onClick={reset}
                disabled={isProcessing}
              >
                <Trash2 className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:rotate-12" />
                Reset
              </Button>
            </CardContent>
          </Card>

          {localSequence.length > 0 && (
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm animate-fadeIn">
              <CardHeader>
                <CardTitle className="text-white text-xl">Current Sequence</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-center gap-2">
                  {localSequence.map((word, idx) => (
                    <div key={idx} className="flex items-center animate-fadeIn">
                      <span className="px-3 py-1 bg-slate-700 rounded-lg border border-slate-600 hover:border-blue-400 transition-colors duration-300">
                        {word}
                      </span>
                      {idx < localSequence.length - 1 && (
                        <ArrowRight className="mx-2 text-slate-500" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Error Display */}
        {actionData?.error && (
          <Card className="bg-red-900/50 border-red-700 backdrop-blur-sm animate-shake">
            <CardContent className="pt-6">
              <p className="text-white flex items-center gap-2">
                <span className="flex-shrink-0">⚠️</span>
                {actionData.error}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Results with Tooltips */}
        {actionData?.bestPath && actionData.bestPath.length > 0 && (
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm transition-all duration-300 hover:scale-[1.01] animate-fadeIn">
            <CardHeader>
              <CardTitle className="text-white text-xl">
                Most Likely Path (Parts of Speech)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center gap-3">
                {actionData.bestPath.map((state, idx) => (
                  <div key={idx} className="flex items-center animate-fadeIn">
                    <div className="px-3 py-2 bg-slate-700/80 rounded-lg border border-slate-600 hover:border-blue-400 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10">
                      <div className="font-medium flex items-center gap-1">
                        {actionData.sequence[idx]}
                        {state && (
                          <PartOfSpeechTooltip 
                            word={actionData.sequence[idx]} 
                            partOfSpeech={state}
                          />
                        )}
                      </div>
                      <div className="text-sm text-blue-300">
                        {state}
                      </div>
                    </div>
                    {idx < actionData.bestPath.length - 1 && (
                      <ArrowRight className="mx-2 text-slate-500" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      <div className="lg:col-span-1 mt-3">
            <ViterbiExplanation 
              currentSequence={localSequence}
              className="sticky top-4"
            />
          </div>
    </div>
  );
}