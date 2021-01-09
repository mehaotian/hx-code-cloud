module.exports =
	`<!DOCTYPE html>
		<html>
			<head>
				<meta charset="utf-8">
				<title></title>
				<style>
					.input_control{
						width:100%;
						margin:0 auto;
					}
					.title {
						margin:0;
						padding:0;
						font-size:16px;
						font-weight:bold;
						color:#333;
					}
					input[type="text"],#btn1,#btn2{
						box-sizing: border-box;
						font-size:14px;
						height:45px;
						border-radius:4px;
						border:1px solid #c8cccf;
						color:#6a6f77;
						-web-kit-appearance:none;
						-moz-appearance: none;
						display:block;
						outline:0;
						padding:0 1em;
						text-decoration:none;
						width:100%;
						color:#333;
					}
					input[type="text"]:focus{
						border:1px solid #666;
					}
					::-moz-placeholder { /* Mozilla Firefox 4 to 18 */
						color: #6a6f77;
					}
					::-moz-placeholder { /* Mozilla Firefox 19+ */
						color: #6a6f77;
					}
					input::-webkit-input-placeholder{
						color: #6a6f77;
					}
				</style>
			</head>
			<body>
				<form>
					<div class="input_control">
						<p class="title">请输入展示标题<p>
						<input id="title" type="text" class="form_input" placeholder="您的代码块叫什么？"/>
					</div>
					<div class="input_control">
						<p class="title">请输入代码块描述<p>
						<input id="excerpt" type="text" class="form_input" placeholder="您的代码块是做什么的？"/>
					</div>
				</form>
				<script>
				function initReceive() {
						
						console.log(document.getElementById('title'))
						console.log('title',title)
						hbuilderx.onDidReceiveMessage((msg)=>{
							if(msg.type == 'DialogButtonEvent'){
								var title = document.getElementById('title').value
								var excerpt = document.getElementById('excerpt').value
								let button = msg.button;
								if(button == '确定'){
										//TODO 处理表单提交
										hbuilderx.postMessage({
												command: 'ok',
												title: title,
												excerpt: excerpt
										});
								}else if(button == '取消'){
										//TODO 处理取消逻辑
												hbuilderx.postMessage({
												command: 'cancel'
										});
								}
							}
					});
				}
				window.addEventListener("hbuilderxReady", initReceive);
			</script>
		</body>
	</html>`;
