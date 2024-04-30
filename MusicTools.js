const musicTools = {
  standardPitch: 440,
  /**
   * Converts MIDI Pitch to the corresponding Frequeny in Hertz (A440)
   * @param {number} midiPitch - the MIDI Pitch Number
   * @returns {number} Frequency in Hertz
   * @example
   * midiPitchtoFrequency(60)
   * returns 261.3
   */
  midiPitchToFrequency: function (midiPitch) {
    return this.standardPitch * Math.pow(2, (midiPitch - 69) / 12);
  },

  /**
   * Converts a frequency in Hz to the corresponding MIDI pitch number.
   * @param {number} frequency - The frequency in Hz.
   * @returns {number} The MIDI pitch number.
   */
  frequencyToMidiPitch: function (frequency) {
    return 69 + 12 * Math.log2(frequency / this.standardPitch);
  },

  /**
   * Converts a Linear Amplitude to dBFS (Decibels Full Scale)
   * @param {number} linAmp The Linear Amplitude change
   * @returns {number} dBFS
   */
  linAmpTodB: function (linAmp) {
    return 20 * Math.log10(linAmp);
  },

  /**
   * Converts dBFS (Decibels Full Scale) to Linear Amplitude
   * @param {number} dBFS
   * @returns {number} in Linear Amplitude
   */
  dBToLinAmp: function (dBFS) {
    return Math.pow(10, dBFS / 20);
  },
};

export default musicTools;
