import Core from './lib'
export function activate(context) {
  const core = Core.getInstance()
  context.subscriptions.push(core.register());
}
export function deactivate() {}
