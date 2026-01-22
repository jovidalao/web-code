import { File } from "@/types/file"
import { StateEffect, StateField } from "@codemirror/state"
import {
  Decoration,
  DecorationSet,
  EditorView,
  ViewPlugin,
  ViewUpdate,
  WidgetType,
  keymap,
} from "@codemirror/view"

// StateEffect: A way to send "messages" to update state.
// We define one effect type for setting the suggestion text.
const setSuggestionEffect = StateEffect.define<string | null>();

// StateField: Holds our suggestion state in the editor.
// - create(): Returns the initial value when the editor loads.
// - update(): Called on every transaction (keystroke, etc.) to potentially update the value.
const suggestionState = StateField.define<string | null>({
  create() {
    return " // TODO: implement this."
  },
  update(value, transaction) {
    // Check each effect in this transaction
    // If we find our setSuggestionEffect, return its new value
    // Otherwise, keep the current value unchanged.
    for (const effect of transaction.effects) {
      if (effect.is(setSuggestionEffect)) {
        return effect.value;
      }
    }
    return value;
  }
});

// WidgetType: Create custom DOM elements to display in the editor.
// toDOM() is called by CodeMirror to create the actual HTML element.
class SuggestionWidget extends WidgetType {
  constructor(readonly text: string) {
    super();
  }
  toDOM() {
    const span = document.createElement("span");
    span.textContent = this.text;
    span.style.opacity = "0.4"; // Ghost text appearance
    span.style.pointerEvents = "none"; // Don't allow interaction
    return span;
  }
}

const renderPlugin = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;

    constructor(view: EditorView) {
      this.decorations = this.build(view);
    }

    update(update: ViewUpdate) {
      // Rebuild docorations if doc changed, cursor moved, or suggestion text changed
      const suggestionChanged = update.transactions.some((transaction) =>
        transaction.effects.some((effect) => effect.is(setSuggestionEffect))
      )
      // doc changed, cursor moved, or suggestion text changed
      const shouldRebuild = update.docChanged || update.selectionSet || suggestionChanged

      if (shouldRebuild) {
        this.decorations = this.build(update.view);
      }
    }

    build(view: EditorView) {
      // Get current suggestion from state
      const suggestion = view.state.field(suggestionState);
      if (!suggestion) {
        return Decoration.none;
      }

      //Create a widget decoration at the cursor position
      const cursor = view.state.selection.main.head;
      return Decoration.set([
        Decoration.widget({
          widget: new SuggestionWidget(suggestion),
          side: 1,
        }).range(cursor)
      ])
    }
  },
  { decorations: (plugin) => plugin.decorations }
)

const acceptSuggestionKeymap = keymap.of([
  {
    key: "Tab",
    run: (view) => {
      const suggestion = view.state.field(suggestionState);
      if (!suggestion) return false; // No suggestion to accept

      const cursor = view.state.selection.main.head;
      view.dispatch({
        changes: { from: cursor, insert: suggestion }, // Insert the suggestion text
        selection: { anchor: cursor + suggestion.length }, // Move cursor to end of suggestion
        effects: [setSuggestionEffect.of(null)] // Clear suggestion
      })
      return true;
    }
  }
])

export const suggestion = (fileName: File["name"]) => [
  suggestionState, // Our state storage
  renderPlugin, // Renders the ghost text
  acceptSuggestionKeymap, // Tab to accept suggestion
]