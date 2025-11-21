import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/Card";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Wand2, Type, Save } from "lucide-react";

export default function EditorPanel({
  slide,
  onApplyInstruction,
  onApplyElementEdit,
}) {
  const [instruction, setInstruction] = useState("");

  return (
    <div className="space-y-6">
      {/* AI Edit Section */}
      <Card className="border-primary/20 shadow-lg shadow-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-primary" />
            AI Assistant
          </CardTitle>
          <CardDescription>
            Describe how you want to change this slide.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder="e.g., Make the title bigger and red, or change the bullet points..."
              className="h-11"
            />
            <Button onClick={() => onApplyInstruction(instruction)} size="lg" className="shrink-0">
              <Wand2 className="mr-2 h-4 w-4" />
              Generate Edit
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Manual Edit Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-border">
          <Type className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-medium text-muted-foreground">Manual Element Edits</h3>
        </div>
        
        <div className="grid gap-4">
          {slide?.elements?.map((el) => (
            <ElementEditor
              key={el.id}
              element={el}
              onApply={onApplyElementEdit}
            />
          ))}
          {(!slide?.elements || slide.elements.length === 0) && (
            <div className="text-center py-8 text-muted-foreground text-sm bg-card/50 rounded-lg border border-dashed border-border">
              No editable text elements found on this slide.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ElementEditor({ element, onApply }) {
  const [val, setVal] = useState(element.text || "");
  const [isDirty, setIsDirty] = useState(false);

  const handleChange = (e) => {
    setVal(e.target.value);
    setIsDirty(e.target.value !== element.text);
  };

  const handleSave = () => {
    onApply(element.id, val);
    setIsDirty(false);
  };

  return (
    <Card className="bg-card/50 hover:bg-card transition-colors">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">
            ID: {element.id}
          </div>
          {isDirty && (
            <span className="text-[10px] font-medium text-amber-500 uppercase tracking-wider">
              Unsaved Changes
            </span>
          )}
        </div>
        <textarea
          value={val}
          onChange={handleChange}
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-y"
          placeholder="Element text content..."
        />
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            variant={isDirty ? "default" : "secondary"}
            size="sm"
            disabled={!isDirty}
          >
            <Save className="mr-2 h-3 w-3" />
            Save Changes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
