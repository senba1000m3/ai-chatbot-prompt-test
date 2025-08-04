"use client";

import React, { useState } from "react";
import { useAdvancedStore, RatingCategory } from "@/lib/store/advanced";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { nanoid } from "nanoid";
import { Plus, Trash2, X, Pencil } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";

export const RatingScaleView = () => {
    const { ratingCategories, setRatingCategories, rubrics, setRubrics } = useAdvancedStore();
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<RatingCategory | null>(null);
    const [tempCategoryName, setTempCategoryName] = useState("");

    const addCategory = () => {
        const newCategory = {
            category_id: nanoid(),
            name: "",
        };
        setRatingCategories([...ratingCategories, newCategory]);
        handleEditClick(newCategory);
    };

    const handleEditClick = (category: RatingCategory) => {
        setEditingCategory(category);
        setTempCategoryName(category.name);
        setIsEditDialogOpen(true);
    };

    const editCategoryName = () => {
        if (editingCategory) {
            setRatingCategories(
                ratingCategories.map(c =>
                    c.category_id === editingCategory.category_id ? { ...c, name: tempCategoryName } : c
                )
            );
        }
        setIsEditDialogOpen(false);
        setEditingCategory(null);
        setTempCategoryName("");
    };

    const deleteCategory = (categoryId: string) => {
        setRatingCategories(
            ratingCategories.filter(c => c.category_id !== categoryId)
        );
        setRubrics(rubrics.filter(r => r.category_id !== categoryId));
    };

    const addRubric = (categoryId: string) => {
        const newRubric = {
            rubric_id: nanoid(),
            category_id: categoryId,
            content: "新的評分標準",
        };
        setRubrics([...rubrics, newRubric]);
    };

    const updateRubricContent = (rubricId: string, content: string) => {
        setRubrics(
            rubrics.map(r =>
                r.rubric_id === rubricId ? { ...r, content } : r
            )
        );
    };

    const deleteRubric = (rubricId: string) => {
        setRubrics(rubrics.filter(r => r.rubric_id !== rubricId));
    };

    return (
        <div className="px-4 py-6 overflow-y-auto h-[calc(100vh-130px)]">
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>編輯評分項目類別名稱</DialogTitle>
                    </DialogHeader>
                    <Input
                        value={tempCategoryName}
                        onChange={(e) => setTempCategoryName(e.target.value)}
                        placeholder="請輸入項目類別名稱"
                    />
                    <DialogFooter>
						<Button type="button" onClick={editCategoryName}>
							 儲存
						</Button>
                        <DialogClose asChild>
                            <Button type="button" variant="secondary">
                                取消
                            </Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className="flex justify-between items-center mb-4 ml-2">
                <Button onClick={addCategory} className="bg-blue-600 hover:bg-blue-700 transition-colors shadow-lg">
                    <Plus className="mr-2 h-4 w-4" />
                    新增評分項目類別
                </Button>
            </div>
            <div className="space-y-3">
                {ratingCategories.map(category => (
                    <fieldset key={category.category_id} className="px-4 border border-3 rounded-lg">
                        <legend className="px-2">
                            <div className="flex items-center gap-3">
                                <span className="text-xl font-semibold">{category.name}</span>
                                <div className="flex items-center">
									<Button variant="ghost" size="icon" onClick={() => handleEditClick(category)}>
										<Pencil className="h-4 w-4" />
									</Button>
									<Button variant="ghost" size="icon" onClick={() => deleteCategory(category.category_id)}>
										<X className="h-4 w-4" />
									</Button>
								</div>
                            </div>
                        </legend>
                        <div className="space-y-2 mt-3 mb-4">
                            {rubrics
                                .filter(r => r.category_id === category.category_id)
                                .map(rubric => (
                                    <div key={rubric.rubric_id} className="flex items-center gap-2">
                                        <Input
                                            value={rubric.content}
                                            onChange={e => updateRubricContent(rubric.rubric_id, e.target.value)}
                                        />
                                        <Button variant="ghost" size="icon" onClick={() => deleteRubric(rubric.rubric_id)}>
                                            <Trash2 className="h-5 w-5" />
                                        </Button>
                                    </div>
                                ))}
                        </div>
                        <Button variant="outline" size="sm" className="mb-6" onClick={() => addRubric(category.category_id)}>
                            <Plus className="mr-2 h-4 w-4" />
                            新增評分標準
                        </Button>
                    </fieldset>
                ))}
            </div>
        </div>
    );
};

