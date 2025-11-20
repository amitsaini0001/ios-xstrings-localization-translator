'use client';

import Image from "next/image";
import { TranslationProvider, useTranslation } from "@/contexts/TranslationContext";
import { Step1Input } from "@/components/steps/Step1Input";
import { Step2Configure } from "@/components/steps/Step2Configure";
import { Step3Settings } from "@/components/steps/Step3Settings";
import { Step4Translate } from "@/components/steps/Step4Translate";
import { Step5Output } from "@/components/steps/Step5Output";
import { Progress } from "@/components/ui/progress";

function WizardContent() {
  const { currentStep } = useTranslation();

  const steps = [
    { number: 1, title: "Input", component: <Step1Input /> },
    { number: 2, title: "Configure", component: <Step2Configure /> },
    { number: 3, title: "Settings", component: <Step3Settings /> },
    { number: 4, title: "Translate", component: <Step4Translate /> },
    { number: 5, title: "Output", component: <Step5Output /> },
  ];

  const currentStepData = steps[currentStep - 1];
  const progressPercentage = ((currentStep - 1) / (steps.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-950 dark:to-black ">
      {/* Header */}
      <header className="border-b bg-white/50 dark:bg-black/50 backdrop-blur-sm sticky top-0 z-50 ">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <Image
              className="dark:invert"
              src="./light-beemur-apps.svg"
              alt="Logo"
              width={100}
              height={100}
              priority
            />
            <h1 className="text-base sm:text-xl font-bold">IOS Translator</h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground hidden md:block">
            Translate iOS XCStrings files with AI
          </p>
        </div>
      </header>

      {/* Step Indicator - Sticky */}
      <div className="sticky top-[57px] z-40 bg-white/95 dark:bg-black/95 backdrop-blur-sm border-b shadow-sm">
        <div className="container mx-auto px-4 py-3 sm:py-4 max-w-4xl">
          <div className="flex items-center justify-between mb-2">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm sm:text-base font-semibold transition-colors ${
                      currentStep >= step.number
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {step.number}
                  </div>
                  <p className="text-xs mt-1 font-medium hidden sm:block">
                    {step.title}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className="flex-1 h-0.5 bg-muted mx-1 sm:mx-2" />
                )}
              </div>
            ))}
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-4 sm:py-8 max-w-4xl">
        {/* Step Content */}
        <div className="mb-8">
          <h2 className="text-xl sm:text-2xl font-bold mb-2">
            Step {currentStep}: {currentStepData.title}
          </h2>
          <div className="h-1 w-20 bg-primary rounded-full mb-4 sm:mb-6" />
          {currentStepData.component}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-8 sm:mt-16 py-4 sm:py-6">
        <div className="container mx-auto px-4 text-center text-xs sm:text-sm text-muted-foreground">
          <p>
            ❤️ Made by <a className="underline" href="https://beemur.com" target="_blank" rel="noopener noreferrer">Beemur Apps</a> in Melbourne, Australia • Powered by OpenAI 
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <TranslationProvider>
      <WizardContent />
    </TranslationProvider>
  );
}
