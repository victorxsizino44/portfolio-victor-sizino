import { Quote } from "lucide-react";

type CaseQuoteProps = {
  quote?: string;
};

export default function CaseQuote({ quote }: CaseQuoteProps) {
  if (!quote) {
    return null;
  }

  return (
    <figure className="card-border m-0 flex h-full w-full items-start gap-5 bg-violet/5 p-6 md:p-7">
      <Quote className="mt-1 flex-none fill-violet text-violet" size={34} strokeWidth={2.2} />
      <blockquote className="text-base font-bold leading-7 text-dark">"{quote}"</blockquote>
    </figure>
  );
}
