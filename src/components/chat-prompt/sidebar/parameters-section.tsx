"use client"

import { motion } from "framer-motion"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { usePromptStore, type ParametersType } from "@/lib/store/prompt"

export function ParametersSection( {isReadOnly} : { isReadOnly: boolean } ) {
	const { parameters, setParameters } = usePromptStore();

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.4, duration: 0.3 }}
    >


      <div className="mb-6">
        <label className="block text-sm mb-3 text-white">Temperature: {parameters.temperature}</label>
        <Slider
          value={[parameters.temperature]}
		  onValueChange={([value]) => setParameters({ ...parameters, temperature: value })}
          max={1}
          min={0}
          step={0.1}
          className="w-full [&_[role=slider]]:bg-blue-500 [&_[role=slider]]:border-blue-500 [&_.bg-primary]:bg-blue-500"
          disabled={isReadOnly}
        />
      </div>

      {/*<div className="grid grid-cols-3 gap-3 mb-6">*/}
      {/*  <div>*/}
      {/*    <label className="block text-sm mb-2 text-white">Batch Size</label>*/}
      {/*    <Select value={batchSize} onValueChange={setBatchSize} disabled={isReadOnly}>*/}
      {/*      <SelectTrigger className="bg-gray-900 border-gray-800 text-white focus:border-blue-500 focus:ring-blue-500 transition-colors">*/}
      {/*        <SelectValue />*/}
      {/*      </SelectTrigger>*/}
      {/*      <SelectContent className="bg-gray-900 border-gray-800">*/}
      {/*        <SelectItem value="1">1</SelectItem>*/}
      {/*        <SelectItem value="5">5</SelectItem>*/}
      {/*        <SelectItem value="10">10</SelectItem>*/}
      {/*      </SelectContent>*/}
      {/*    </Select>*/}
      {/*  </div>*/}
      {/*  <div>*/}
      {/*    <label className="block text-sm mb-2 text-white">Parameter 2</label>*/}
      {/*    <Select value={parameter2} onValueChange={setParameter2} disabled={isReadOnly}>*/}
      {/*      <SelectTrigger className="bg-gray-900 border-gray-800 text-white focus:border-blue-500 focus:ring-blue-500 transition-colors">*/}
      {/*        <SelectValue />*/}
      {/*      </SelectTrigger>*/}
      {/*      <SelectContent className="bg-gray-900 border-gray-800">*/}
      {/*        <SelectItem value="option1">Option 1</SelectItem>*/}
      {/*        <SelectItem value="option2">Option 2</SelectItem>*/}
      {/*      </SelectContent>*/}
      {/*    </Select>*/}
      {/*  </div>*/}
      {/*  <div>*/}
      {/*    <label className="block text-sm mb-2 text-white">Parameter 3</label>*/}
      {/*    <Select value={parameter3} onValueChange={setParameter3} disabled={isReadOnly}>*/}
      {/*      <SelectTrigger className="bg-gray-900 border-gray-800 text-white focus:border-blue-500 focus:ring-blue-500 transition-colors">*/}
      {/*        <SelectValue />*/}
      {/*      </SelectTrigger>*/}
      {/*      <SelectContent className="bg-gray-900 border-gray-800">*/}
      {/*        <SelectItem value="option1">Option 1</SelectItem>*/}
      {/*        <SelectItem value="option2">Option 2</SelectItem>*/}
      {/*      </SelectContent>*/}
      {/*    </Select>*/}
      {/*  </div>*/}
      {/*</div>*/}
    </motion.div>
  )
}
