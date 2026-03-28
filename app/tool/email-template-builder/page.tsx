import EmailTemplateBuilder from "./components/EmailTemplateBuilder";

export default function EmailTemplateBuilderPage() {
  return (
    <div className="container mx-auto">
      <div className="mb-6">
        <p className="text-muted-foreground">
          Build responsive HTML email templates with live preview,
          customization, and one-click export
        </p>
      </div>
      <EmailTemplateBuilder />
    </div>
  );
}
