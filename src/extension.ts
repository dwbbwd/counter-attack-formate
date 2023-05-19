import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "counter-attack-formate" is now active!');

	let disposable = vscode.commands.registerCommand('counter-attack-formate.formatters', () => {
		
		vscode.window.showInformationMessage('Hello World from counter-attack-formate!');
		let editor = vscode.window.activeTextEditor;
		if (!editor) 
			return;
		
		let document = editor.document;
		if (document.languageId !== 'typescript') 
      		return;
		
		let range = new vscode.Range(0, 0, document.lineCount, 0);
		let text = document.getText(range);
		let formattedText = textFormate(text);
		let fullRange = document.validateRange(range);
		let edit = new vscode.TextEdit(fullRange, formattedText);
		let change = new vscode.WorkspaceEdit();
		change.set(document.uri, [edit]);
		vscode.workspace.applyEdit(change);
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}

function textFormate(text:string){
	const arr = text.split('\n');
	const otherLine = [];
	//匹配开头是import中间有from行
	const importReg = /import.*from\s\'.*\';/;
	//匹配开头是import 中间没有from行例如 import 'reflect-metadata';
	const onlyImportReg = /import\s\'.*\';/;
	const importLine:{
		[length:number]:{
			colunms:string[],
			line:string
		}[]
	}={};
	const firstLine :{
		[length:number]:{
			colunms:string[],
			line:string
		}[]
	}={};
	for (const r of arr) {
		if(r.match(importReg)){
			//匹配改行中from后面的内容不包含from
			const matchs = r.match(/(?<=from\s\').*(?=\';)/);
			if(!matchs)
				continue;

			//将匹配出来的matchs[0]按照/分组
			const colunms = matchs[0].split('/');
			importLine[colunms.length]??=[];
			importLine[colunms.length].push({
				colunms:colunms,
				line:r
			});
		}else if(r.match(onlyImportReg)){
			const matchs = r.match(/(?<=import\s\').*(?=\';)/);
			if(!matchs)
				continue;

			const colunms = matchs[0].split('/');
			firstLine[colunms.length]??=[];
			firstLine[colunms.length].push({
				colunms:colunms,
				line:r
			});
		}else{
			otherLine.push(r);
		}
	}
	
	for (const r of Object.values(importLine)) {
		// 遍历r的colunms的每个元素与其他行的colunms的每个元素进行比较
		for(let i=0;i<r.length;i++){
			for(let j=i+1;j<r.length;j++){
				//比较两个数组的每个元素
				for(let k=0;k<r[i].colunms.length;k++){
					if(r[i].colunms[k]===r[j].colunms[k])
						continue;
					if(r[i].colunms[k]>r[j].colunms[k]){
						const temp = r[i];
						r[i] = r[j];
						r[j] = temp;
						break;
					}
					break;
				}
			}
		}
	}
	for (const r of Object.values(firstLine)) {
		// 遍历r的colunms的每个元素与其他行的colunms的每个元素进行比较
		for(let i=0;i<r.length;i++){
			for(let j=i+1;j<r.length;j++){
				//比较两个数组的每个元素
				for(let k=0;k<r[i].colunms.length;k++){
					if(r[i].colunms[k]===r[j].colunms[k])
						continue;
					if(r[i].colunms[k]>r[j].colunms[k]){
						const temp = r[i];
						r[i] = r[j];
						r[j] = temp;
						break;
					}
					break;
				}
			}
		}
	}
	const tentent = '';
	const firstArr = [];
	for (const r of Object.values(firstLine)) {
		for (const cr of r) {
			firstArr.push(cr.line)
		}
	}

	const importArr = [];
	for (const r of Object.values(importLine)) {
		for (const cr of r) {
			importArr.push(cr.line)
		}
	}
	const textArr = [firstArr.join('\n'),importArr.join('\n'),otherLine.join('\n')].join('\n');
	
	return textArr;
}
