/**
 * Cover Letter Context
 *
 * Manages state for cover letter templates, user saved letters,
 * and current editing session.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import * as coverLetterService from '../services/coverLetterService';
import { DEFAULT_FORM_DATA } from '../types/coverLetterTypes';

const CoverLetterContext = createContext();

export const useCoverLetter = () => {
  const context = useContext(CoverLetterContext);
  if (!context) {
    throw new Error('useCoverLetter must be used within CoverLetterProvider');
  }
  return context;
};

export const CoverLetterProvider = ({ children }) => {
  const { user } = useAuth();

  // Templates state
  const [templates, setTemplates] = useState([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [templatesError, setTemplatesError] = useState(null);

  // User saved cover letters state
  const [savedLetters, setSavedLetters] = useState([]);
  const [savedLettersLoading, setSavedLettersLoading] = useState(false);
  const [savedLettersError, setSavedLettersError] = useState(null);

  // Current editing state
  const [currentTemplate, setCurrentTemplate] = useState(null);
  const [currentLetter, setCurrentLetter] = useState(null);
  const [formData, setFormData] = useState(DEFAULT_FORM_DATA);
  const [customizedContent, setCustomizedContent] = useState('');

  // UI state
  const [showTemplateBrowser, setShowTemplateBrowser] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [showSavedLetters, setShowSavedLetters] = useState(false);

  /**
   * Fetch all templates with optional filters
   */
  const fetchTemplates = async (filters = {}) => {
    setTemplatesLoading(true);
    setTemplatesError(null);

    try {
      const data = await coverLetterService.fetchTemplates(filters);
      setTemplates(data);
      return data;
    } catch (error) {
      console.error('Error fetching templates:', error);
      setTemplatesError(error.message);
      return [];
    } finally {
      setTemplatesLoading(false);
    }
  };

  /**
   * Fetch user's saved cover letters
   */
  const fetchSavedLetters = async () => {
    if (!user) {
      setSavedLetters([]);
      return;
    }

    setSavedLettersLoading(true);
    setSavedLettersError(null);

    try {
      const data = await coverLetterService.fetchUserCoverLetters(user.id);
      setSavedLetters(data);
      return data;
    } catch (error) {
      console.error('Error fetching saved letters:', error);
      setSavedLettersError(error.message);
      return [];
    } finally {
      setSavedLettersLoading(false);
    }
  };

  /**
   * Start editing a template (create new cover letter from template)
   */
  const startNewLetter = (template) => {
    setCurrentTemplate(template);
    setCurrentLetter(null);
    setFormData(DEFAULT_FORM_DATA);
    setCustomizedContent(template.template_content);
    setShowTemplateBrowser(false);
    setShowEditor(true);
  };

  /**
   * Start editing an existing saved cover letter
   */
  const editSavedLetter = async (letterId) => {
    if (!user) {
      throw new Error('User must be authenticated to edit cover letters');
    }

    setSavedLettersLoading(true);

    try {
      const letter = await coverLetterService.fetchUserCoverLetterById(letterId, user.id);

      if (!letter) {
        throw new Error('Cover letter not found');
      }

      setCurrentLetter(letter);
      setCurrentTemplate(letter.template || null);
      setCustomizedContent(letter.customized_content);

      // Try to extract form data from customized content
      // This is a best-effort extraction
      setFormData(DEFAULT_FORM_DATA);

      setShowSavedLetters(false);
      setShowEditor(true);

      return letter;
    } catch (error) {
      console.error('Error loading cover letter for editing:', error);
      setSavedLettersError(error.message);
      throw error;
    } finally {
      setSavedLettersLoading(false);
    }
  };

  /**
   * Save current cover letter (create or update)
   */
  const saveCoverLetter = async (title = 'Untitled Cover Letter') => {
    if (!user) {
      throw new Error('User must be authenticated to save cover letters');
    }

    try {
      if (currentLetter) {
        // Update existing letter
        const updated = await coverLetterService.updateUserCoverLetter(currentLetter.id, {
          title,
          customized_content: customizedContent,
        });

        // Update in saved letters list
        setSavedLetters(prev =>
          prev.map(letter => (letter.id === updated.id ? updated : letter))
        );

        setCurrentLetter(updated);
        return updated;
      } else {
        // Create new letter
        const created = await coverLetterService.createUserCoverLetter({
          user_id: user.id,
          template_id: currentTemplate?.id || null,
          title,
          customized_content: customizedContent,
        });

        // Add to saved letters list
        setSavedLetters(prev => [created, ...prev]);

        setCurrentLetter(created);
        return created;
      }
    } catch (error) {
      console.error('Error saving cover letter:', error);
      throw error;
    }
  };

  /**
   * Delete a saved cover letter
   */
  const deleteCoverLetter = async (letterId) => {
    if (!user) {
      throw new Error('User must be authenticated to delete cover letters');
    }

    try {
      await coverLetterService.deleteUserCoverLetter(letterId);

      // Remove from saved letters list
      setSavedLetters(prev => prev.filter(letter => letter.id !== letterId));

      // If currently editing this letter, clear the editor
      if (currentLetter && currentLetter.id === letterId) {
        resetEditor();
      }
    } catch (error) {
      console.error('Error deleting cover letter:', error);
      throw error;
    }
  };

  /**
   * Duplicate a saved cover letter
   */
  const duplicateCoverLetter = async (letterId) => {
    if (!user) {
      throw new Error('User must be authenticated to duplicate cover letters');
    }

    try {
      const duplicate = await coverLetterService.duplicateUserCoverLetter(letterId, user.id);

      // Add to saved letters list
      setSavedLetters(prev => [duplicate, ...prev]);

      return duplicate;
    } catch (error) {
      console.error('Error duplicating cover letter:', error);
      throw error;
    }
  };

  /**
   * Update form data field
   */
  const updateFormField = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  /**
   * Update form data (bulk update)
   */
  const updateFormData = (newFormData) => {
    setFormData(prev => ({
      ...prev,
      ...newFormData,
    }));
  };

  /**
   * Update customized content
   */
  const updateCustomizedContent = (content) => {
    setCustomizedContent(content);
  };

  /**
   * Reset editor state
   */
  const resetEditor = () => {
    setCurrentTemplate(null);
    setCurrentLetter(null);
    setFormData(DEFAULT_FORM_DATA);
    setCustomizedContent('');
    setShowEditor(false);
  };

  /**
   * Open template browser
   */
  const openTemplateBrowser = () => {
    setShowTemplateBrowser(true);
  };

  /**
   * Close template browser
   */
  const closeTemplateBrowser = () => {
    setShowTemplateBrowser(false);
  };

  /**
   * Open saved letters dashboard
   */
  const openSavedLetters = () => {
    setShowSavedLetters(true);
  };

  /**
   * Close saved letters dashboard
   */
  const closeSavedLetters = () => {
    setShowSavedLetters(false);
  };

  /**
   * Load templates on mount
   */
  useEffect(() => {
    fetchTemplates();
  }, []);

  /**
   * Load saved letters when user changes
   */
  useEffect(() => {
    if (user) {
      fetchSavedLetters();
    } else {
      setSavedLetters([]);
    }
  }, [user]);

  const value = {
    // Templates
    templates,
    templatesLoading,
    templatesError,
    fetchTemplates,

    // Saved letters
    savedLetters,
    savedLettersLoading,
    savedLettersError,
    fetchSavedLetters,

    // Current editing state
    currentTemplate,
    currentLetter,
    formData,
    customizedContent,

    // Actions
    startNewLetter,
    editSavedLetter,
    saveCoverLetter,
    deleteCoverLetter,
    duplicateCoverLetter,
    updateFormField,
    updateFormData,
    updateCustomizedContent,
    resetEditor,

    // UI state
    showTemplateBrowser,
    showEditor,
    showSavedLetters,
    openTemplateBrowser,
    closeTemplateBrowser,
    openSavedLetters,
    closeSavedLetters,
  };

  return (
    <CoverLetterContext.Provider value={value}>
      {children}
    </CoverLetterContext.Provider>
  );
};

export default CoverLetterContext;
