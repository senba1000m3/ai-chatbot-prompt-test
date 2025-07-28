"use client";

// Components & UI
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Muted } from "./common/typography";

// Types & Interfaces
interface TestDataTableProps {
	data: {
		id: string;
		name: string;
		updatedAt: string;
		author: string;
		actions: React.ReactNode;
	}[];
	onRowClick?: (id: string) => void;
}

export function TestDataTable({ data, onRowClick }: TestDataTableProps) {
	return (
		<div className="rounded-md border">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead className="w-60">名稱</TableHead>
						<TableHead>ID</TableHead>
						<TableHead>上次更新</TableHead>
						<TableHead>作者</TableHead>
						<TableHead>操作</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{data.map((item) => (
						<TableRow
							key={item.id}
							className={onRowClick ? "cursor-pointer hover:bg-muted/50" : ""}
							onClick={onRowClick ? () => onRowClick(item.id) : undefined}
						>
							<TableCell className="font-medium">{item.name}</TableCell>
							<TableCell><Muted className="font-mono">{item.id}</Muted></TableCell>
							<TableCell>{item.updatedAt}</TableCell>
							<TableCell>{item.author}</TableCell>
							<TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
								{item.actions}
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	)
}