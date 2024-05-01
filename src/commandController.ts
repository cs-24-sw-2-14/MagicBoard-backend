import { Namespace } from "socket.io";
import { DrawCommand } from "./commands/draw"
import { MoveCommand } from "./commands/move"

export interface CommandInterface {
  commandId: number
  owner: string
  execute: (socket: Namespace) => void
  undo: (socket: Namespace) => void
  redo: (socket: Namespace) => void
}

export type Command = (DrawCommand | MoveCommand)

export class CommandController {
  undoStack: (DrawCommand | MoveCommand)[]
  redoStack: (DrawCommand | MoveCommand)[]
  namespace: Namespace;
  constructor(namespace: Namespace) {
    this.undoStack = []
    this.redoStack = []
    this.namespace = namespace
  }
  execute(command: (DrawCommand | MoveCommand)) {
    command.execute(this.namespace)
    this.redoStack = []
    this.undoStack.push(command)
  }
  undo(username: string) {
    if (this.undoStack.length === 0) return
    const commandIndex = this.undoStack.findLastIndex((command: (DrawCommand | MoveCommand)) => command.owner === username)
    if (!commandIndex) return
    const command = this.undoStack.splice(commandIndex, 1)[0]
    command.undo(this.namespace)
    this.redoStack.push(command)
  }

  redo(username: string) {
    if (this.redoStack.length === 0) return
    const commandIndex = this.redoStack.findLastIndex((command: (DrawCommand | MoveCommand)) => command.owner === username)
    if (!commandIndex) return
    const command = this.redoStack.splice(commandIndex, 1)[0]
    command.redo(this.namespace)
    let spliceIndex = 0
    // Find the index to insert the command into the undo stack
    for (let i = this.undoStack.length - 1; i >= 0; i--) {
      if (this.undoStack[i].commandId < command.commandId) {
        spliceIndex = i + 1
        break
      }
    }
    this.undoStack.splice(spliceIndex, 0, command)
  }
}