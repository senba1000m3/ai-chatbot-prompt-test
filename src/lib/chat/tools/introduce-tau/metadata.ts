import { z } from "zod";


// ? Input parameters
export const parameters = z.object({
	needIntroduction: z.boolean().describe("Whether the introduction document for the system (project tau) is needed. Currently, this is always true as no parameters are required."),
}) ;

export type IntroduceTauParameters = z.infer<typeof parameters>;

// ? Output schema
// 1. Action passes schema to streamObject for output generation
// 2. Stream receiver uses schema to parse object from streamObject
// 3. Component uses inferred type to render the output
export const schema = z.object({
  content: z.string().describe("The content of the introduction document for the system (project tau)."),
});

export type IntroduceTauSchema = z.infer<typeof schema>;

export const documentation = `
# Generative AI Tool Development Guide for Project Tau

This documentation provides guidance on creating new tools for generative AI in Project Tau. These tools enhance AI capabilities by enabling specific functionalities through a structured architecture.

## Table of Contents

1. Tool Structure Overview
2. Creating a New Tool
3. Defining Tool Metadata
4. Implementing Server Actions
5. Creating UI Components
6. Tool Index Design
7. Registering Tools
8. Examples and Best Practices

## Tool Structure Overview

Each AI tool typically consists of three main components:

1. **Metadata** - Defines input parameters and output structure
2. **Action** - Contains the server-side logic for the tool
3. **Component** - Defines how to display the tool's results in the frontend
4. **Index** - Consolidates exports and provides configuration metadata

These files are typically organized in a dedicated directory for the tool: \`src/lib/chat/tools/[tool-name]/\`.

## Creating a New Tool

### Defining Tool Metadata

First, create a \`metadata.ts\` file to define the input parameters and output structure:

\`\`\`typescript
import { z } from "zod";

// Input parameters
export const parameters = z.object({
  inputParam1: z.string().describe("Description of the first input parameter"),
  inputParam2: z.number().describe("Description of the second input parameter"),
  // More parameters...
});

export type MyNewToolParameters = z.infer<typeof parameters>;

// Output structure
export const schema = z.object({
  title: z.string().describe("Title of the output"),
  results: z.array(
    z.object({
      key: z.string().describe("Key of the result"),
      value: z.string().describe("Value of the result"),
    })
  ).describe("Array of results"),
  // More output fields...
});

export type MyNewToolSchema = z.infer<typeof schema>;
\`\`\`

### Implementing Server Actions

Next, create an \`action.ts\` file to implement the tool's logic:

\`\`\`typescript
"use server";
import { streamObject } from "ai";
import { createStreamableValue } from "ai/rsc";
import { openai } from "@ai-sdk/openai";

// Import tool metadata
import { type MyNewToolParameters, schema } from "./metadata";

export async function generateMyNewToolAction({
  inputParam1,
  inputParam2,
  // Other parameters...
}: MyNewToolParameters) {
  const stream = createStreamableValue();

  (async () => {
    const { partialObjectStream } = streamObject({
      model: openai("gpt-4o"), // Or another appropriate model
      schema: schema,
      messages: [
        {
          role: "system",
          content: "System prompt describing the tool's functionality and expected output"
        },
        {
          role: "user",
          content: \`Prompt based on input parameters: \${inputParam1}, \${inputParam2}\`
        }
      ],
    });

    try {
      for await (const partialObject of partialObjectStream) {
        stream.update(partialObject);
      }
    } catch (error) {
      console.error(error);
    }

    stream.done();
  })();

  return stream.value;
}
\`\`\`

### Creating UI Components

Then, create a \`component.tsx\` file to define how to display the tool's results:

\`\`\`tsx
"use client";
import { memo } from "react";

// Import tool types
import type { MyNewToolSchema } from "./metadata";

// Import UI components
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MarkdownText } from "@/components/common/typography";

export function MyNewTool({ result, ...props }: { result: MyNewToolSchema }) {
  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>{result.title}</CardTitle>
      </CardHeader>
      <CardContent>
        {result.results.map((item, index) => (
          <div key={index} className="mb-4">
            <h3 className="text-lg font-semibold">{item.key}</h3>
            <MarkdownText>{item.value}</MarkdownText>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
\`\`\`

## Tool Index Design

Create an \`index.ts\` file to centralize exports and provide configuration metadata:

\`\`\`typescript
// Export metadata
export {
  parameters,
  schema,
  type MyNewToolParameters,
  type MyNewToolSchema
} from './metadata';

// Export action
export { generateMyNewToolAction } from './action';

// Export component
export { MyNewTool } from './component';

// Tool configuration
export const toolConfig = {
  name: 'myNewTool',
  displayName: 'My New Tool',
  description: 'This tool is used for...',
  icon: 'IconComponentName', // If there's a corresponding icon component
  category: 'analysis', // Tool category, e.g., 'analysis', 'generation', 'utility'
  guidePrompt: \`Use this tool to... specific usage scenario description...\`,
  order: 10, // Display order in the tool list
  // Advanced fields:
  examples: ['Example 1', 'Example 2'],
  limitations: 'This tool has limitations in...',
  isEnabled: true, // Or a function returning boolean
  version: '1.0.0',
};
\`\`\`

## Registering Tools

Finally, register your tool in the appropriate configuration file:

\`\`\`typescript
import * as StepBlockTool from './tools/step-block';
import * as MyNewTool from './tools/my-new-tool';

// Tool configurations
export const CHAT_TOOL_CONFIGS = {
  [StepBlockTool.toolConfig.name]: StepBlockTool.toolConfig,
  [MyNewTool.toolConfig.name]: MyNewTool.toolConfig,
} as const;

// Tool names
export const CHAT_TOOL_NAMES = Object.keys(CHAT_TOOL_CONFIGS);

// Tool implementations
export const CHAT_TOOLS = {
  [StepBlockTool.toolConfig.name]: {
    parameters: StepBlockTool.parameters,
    execute: StepBlockTool.generateStepsAction,
    render: StepBlockTool.StepBlock,
  },

  [MyNewTool.toolConfig.name]: {
    parameters: MyNewTool.parameters,
    execute: MyNewTool.generateMyNewToolAction,
    render: MyNewTool.MyNewTool,
  },
};
\`\`\`

## Examples and Best Practices

### The StepBlock Tool Example

Examine the \`step-block\` tool implementation for reference:

- \`metadata.ts\` defines input parameters and output structure
- \`action.ts\` uses \`streamObject\` to generate structured data from an AI model
- \`component.tsx\` presents the data in a user-friendly way

### Best Practices

1. **Clear Input Parameters**: Ensure each parameter has a clear description to help the AI understand what's needed
2. **Strict Output Structure**: Use Zod to define strict output structures for consistent AI outputs
3. **Error Handling**: Properly handle errors in actions to ensure user experience isn't affected
4. **Responsive UI**: Create components that consider various screen sizes for a good responsive experience
5. **Clear Guide Prompts**: Provide clear guidance prompts in \`toolConfig\` to tell the AI when and how to use the tool
6. **Consistent Naming**: Use consistent naming conventions across all files
7. **Modular Design**: Keep each tool's functionality self-contained and modular
8. **Documentation**: Document your tool's purpose, inputs, outputs, and limitations

### Advanced Tool Registration

For projects with many tools, consider a more automated registration approach:

\`\`\`typescript
import * as StepBlockTool from './tools/step-block';
import * as MyNewTool from './tools/my-new-tool';
// More tool imports...

// Consolidate all tools into an array
const allTools = [
  StepBlockTool,
  MyNewTool,
  // More tools...
];

// Automatically generate configurations
export const CHAT_TOOL_CONFIGS = allTools.reduce((acc, tool) => {
  acc[tool.toolConfig.name] = tool.toolConfig;
  return acc;
}, {} as Record<string, any>);

export const CHAT_TOOL_NAMES = Object.keys(CHAT_TOOL_CONFIGS);

// Automatically generate tool implementations
export const CHAT_TOOLS = allTools.reduce((acc, tool) => {
  acc[tool.toolConfig.name] = {
    parameters: tool.parameters,
    execute: tool.execute || tool.generateAction,
    render: tool.component || tool[tool.toolConfig.name],
  };
  return acc;
}, {} as Record<string, any>);
\`\`\`

By following these guidelines and best practices, you can create powerful and user-friendly AI tools that extend the capabilities of Project Tau.
`