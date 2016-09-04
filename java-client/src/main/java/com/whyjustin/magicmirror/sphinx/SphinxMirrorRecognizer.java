/**
 * Copyright (c) 2016 Justin Young
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
 * documentation files (the "Software"), to deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the
 * Software.
 */
package com.whyjustin.magicmirror.sphinx;

import java.io.IOException;
import java.io.InputStream;

import javax.sound.sampled.LineUnavailableException;

import com.amazon.alexa.avs.AudioCapture;
import com.amazon.alexa.avs.AudioInputFormat;
import com.amazon.alexa.avs.MicrophoneLineFactory;
import com.amazon.alexa.avs.RecordingRMSListener;
import com.amazon.alexa.avs.RecordingStateListener;
import edu.cmu.sphinx.api.AbstractSpeechRecognizer;
import edu.cmu.sphinx.api.Configuration;
import edu.cmu.sphinx.frontend.util.StreamDataSource;
import edu.cmu.sphinx.recognizer.Recognizer.State;

public class SphinxMirrorRecognizer
    extends AbstractSpeechRecognizer
    implements RecordingStateListener, RecordingRMSListener
{
  AudioCapture microphone = AudioCapture
      .getAudioHardware(AudioInputFormat.LPCM.getAudioFormat(), new MicrophoneLineFactory());

  public SphinxMirrorRecognizer(final Configuration configuration) throws IOException {
    super(configuration);
    recognizer.allocate();

    Runtime.getRuntime().addShutdownHook(new Thread(() -> {
      recognizer.deallocate();
    }));
  }

  public State getState() {
    return super.recognizer.getState();
  }

  public void startRecognition() throws IOException, LineUnavailableException {
    InputStream inputStream = microphone.getAudioInputStream(this, this);
    context.getInstance(StreamDataSource.class).setInputStream(inputStream);
  }

  public void stopRecognition() {
    microphone.stopCapture();
  }

  @Override
  public void rmsChanged(final int rms) {

  }

  @Override
  public void recordingStarted() {

  }

  @Override
  public void recordingCompleted() {

  }
}
