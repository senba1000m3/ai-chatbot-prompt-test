"use client"

import { useState, useEffect } from "react"
import { useAdvancedStore } from "@/lib/store/advanced"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { CheckCircle, Star, Pencil, RotateCcw, Check } from "lucide-react"

interface RatingScaleMessageProps {
	versionId: string
	modelId: string
	onComplete: () => void
	onUpdate: () => void
	onStartNewConversation: () => void
	onSave: () => void
}

interface AnsweredQuestion {
	category: string
	rubric_id: string
	content: string
	score: number
}

export const RatingScaleMessage = ({ versionId, modelId, onComplete, onUpdate, onStartNewConversation, onSave }: RatingScaleMessageProps) => {
	const { ratingCategories, rubrics, setVersionRating, clearVersionRatings } = useAdvancedStore()
	const [currentIndex, setCurrentIndex] = useState(0)
	const [isCompleted, setIsCompleted] = useState(false)
	const [answeredQuestions, setAnsweredQuestions] = useState<AnsweredQuestion[]>([])
	const [editingIndex, setEditingIndex] = useState<number | null>(null)
	const [isSaved, setIsSaved] = useState(false)

	const [allRubrics, setAllRubrics] = useState<{ category: string; rubric_id: string; content: string }[]>([])

	useEffect(() => {
		const sortedCategories = [...ratingCategories]
		const rubricsByCat = sortedCategories.flatMap((cat) =>
			rubrics
				.filter((r) => r.category_id === cat.category_id)
				.map((r) => ({ category: cat.name, rubric_id: r.rubric_id, content: r.content })),
		)
		setAllRubrics(rubricsByCat)
	}, [ratingCategories, rubrics])

	useEffect(() => {
		onUpdate()
	}, [answeredQuestions, isCompleted, editingIndex, onUpdate, isSaved])

	const currentItem = allRubrics[currentIndex]

	const handleRating = (score: number) => {
		if (!currentItem) return
		setVersionRating(versionId, modelId, currentItem.rubric_id, score)

		setAnsweredQuestions((prev) => [
			...prev,
			{
				category: currentItem.category,
				content: currentItem.content,
				rubric_id: currentItem.rubric_id,
				score: score,
			},
		])

		const nextIndex = currentIndex + 1
		if (nextIndex < allRubrics.length) {
			setCurrentIndex(nextIndex)
		} else {
			setIsCompleted(true)
		}
	}

	const handleUpdateRating = (index: number, score: number) => {
		const updatedQuestion = answeredQuestions[index]
		if (!updatedQuestion) return

		setVersionRating(versionId, modelId, updatedQuestion.rubric_id, score)

		const newAnsweredQuestions = [...answeredQuestions]
		newAnsweredQuestions[index].score = score
		setAnsweredQuestions(newAnsweredQuestions)
		setEditingIndex(null)
	}

	const handleReset = () => {
		clearVersionRatings(versionId, modelId)
		setAnsweredQuestions([])
		setCurrentIndex(0)
		setIsCompleted(false)
		setEditingIndex(null)
		setIsSaved(false)
	}

	const handleSave = () => {
		onSave()
		setIsSaved(true)
	}

	const handleStartNew = () => {
		onStartNewConversation()
	}

	if (allRubrics.length === 0 && !isCompleted) {
		return (
			<div className="text-center text-gray-400 py-8">
				<p>沒有可用的評分標準。</p>
			</div>
		)
	}

	return (
		<div className="space-y-4 my-4 px-2">
			{answeredQuestions.map((item, index) => (
				<motion.div
					key={index}
					initial={{ opacity: 0, x: -20 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.3 }}
					className=""
				>
					<div className="relative p-3 rounded-lg bg-gray-900 text-gray-400 border border-gray-800">
						{!isSaved && editingIndex !== index && (
							<div className="absolute top-2 right-2">
								<Button
									variant="ghost"
									size="icon"
									className="h-6 w-6 p-0 text-gray-500 hover:text-white"
									onClick={() => setEditingIndex(editingIndex === index ? null : index)}
								>
									<Pencil className="w-3 h-3" />
								</Button>
							</div>
						)}
						<div className="text-sm whitespace-pre-wrap pr-6">
							<div className="mb-2 border-b border-gray-700 pb-1">
								<span className="text-sm font-semibold text-gray-400">{item.category}</span>
							</div>
							<p className="mt-1 text-gray-400">{item.content}</p>
						</div>

						{editingIndex === index ? (
							<motion.div
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								className="flex justify-center space-x-2 pt-3 mt-2 border-t border-gray-700 gap-2"
							>
								{[1, 2, 3, 4, 5].map((score) => (
									<Button
										key={score}
										size="sm"
										variant={item.score === score ? "default" : "outline"}
										onClick={() => handleUpdateRating(index, score)}
										className="w-10 bg-gray-700 border-gray-600 hover:bg-blue-600 hover:text-white transition-colors"
									>
										{score}
									</Button>
								))}
							</motion.div>
						) : (
							<div className="flex items-center justify-end mt-2 text-yellow-400">
								<Star className="w-4 h-4 mr-1 fill-current" />
								<span className="font-bold">{item.score} 分</span>
							</div>
						)}
					</div>
				</motion.div>
			))}

			{isCompleted ? (
				isSaved ? (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						className="text-center py-4 flex flex-col items-center justify-center"
					>
						<div className="flex items-center text-green-400 mb-4">
							<CheckCircle className="w-6 h-6 mr-2" />
							<p className="text-lg">評分完畢</p>
						</div>
						<div className="mt-2">
							<p className="text-gray-400 mb-3">是否要清除對話並開啟新一輪測試？</p>
							<Button onClick={handleStartNew} variant="secondary" className="bg-indigo-600 hover:bg-indigo-700">
								開啟新對話
							</Button>
						</div>
					</motion.div>
				) : (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						className="text-center py-4 flex flex-col items-center justify-center"
					>
						<div className="flex items-center text-green-400 mb-4">
							<CheckCircle className="w-6 h-6 mr-2" />
							<p className="text-lg">所有項目皆已評分</p>
						</div>
						<div className="flex space-x-4">
							<Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
								<Check className="w-4 h-4 mr-2" />
								確定儲存
							</Button>
							<Button onClick={handleReset} variant="outline" className="text-gray-300 border-gray-600 hover:bg-gray-700 hover:text-white">
								<RotateCcw className="w-4 h-4 mr-2" />
								全部重填
							</Button>
						</div>
					</motion.div>
				)
			) : currentItem ? (
				<>
					<motion.div
						key={currentItem.rubric_id}
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.3 }}
						className=""
					>
						<div className="relative p-3 rounded-lg bg-gray-800 text-white border border-gray-700">
							<div className="text-sm whitespace-pre-wrap">
								<div className="mb-2 border-b border-gray-700 pb-1">
									<span className="text-base font-semibold text-blue-400">{currentItem.category}</span>
								</div>
								<p className="mt-1 mb-7">{currentItem.content}</p>
							</div>
						</div>
					</motion.div>

					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.2, duration: 0.3 }}
						className="flex justify-center space-x-2 pt-2 gap-2"
					>
						{[1, 2, 3, 4, 5].map((score) => (
							<motion.div key={score} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
								<Button
									size="sm"
									variant="outline"
									onClick={() => handleRating(score)}
									className="w-10 bg-gray-700 border-gray-600 hover:bg-blue-600 hover:text-white transition-colors"
								>
									{score}
								</Button>
							</motion.div>
						))}
					</motion.div>
				</>
			) : null}
		</div>
	)
}

