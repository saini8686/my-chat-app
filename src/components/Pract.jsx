// import "./styles.css";
import EmojiPicker, {
  EmojiStyle,
  SkinTones,
  Theme,
  Categories,
  EmojiClickData,
  Emoji,
  SuggestionMode,
  SkinTonePickerLocation,
} from "emoji-picker-react";
import { useState } from "react";
import * as React from "react";

export default function App() {
  const [selectedEmoji, setSelectedEmoji] = useState("1f60a");
  const [inputValue, setInputValue] = useState("");

  function onClick(emojiData: EmojiClickData, event: MouseEvent) {
    setInputValue(
      (inputValue) =>
        inputValue + (emojiData.isCustom ? emojiData.unified : emojiData.emoji)
    );
    setSelectedEmoji(emojiData.unified);
  }

  return (
    <div className="App">
      <h2>Emoji Picker React Demo</h2>
      <div className="show-emoji">
        <h3>Your selected Emoji is:</h3>
        {selectedEmoji ? <Emoji unified={selectedEmoji} size={77} /> : null}
      </div>
      <div>
        <input
          className="text-input"
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Select Emojis..."
        />
      </div>
      <EmojiPicker
        onEmojiClick={onClick}
        autoFocusSearch={false}
        emojiStyle={EmojiStyle.NATIVE}
        // Additional options commented out
      />
    </div>
  );
}
