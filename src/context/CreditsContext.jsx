/**
 * Credits Context
 * Manages user credits state and operations
 */

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useAuth } from './AuthContext'
import { supabase } from '../config/supabase'

const CreditsContext = createContext({})

export const useCredits = () => {
  const context = useContext(CreditsContext)
  if (!context) {
    throw new Error('useCredits must be used within CreditsProvider')
  }
  return context
}

export const CreditsProvider = ({ children }) => {
  const { user } = useAuth()
  const [credits, setCredits] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [transactions, setTransactions] = useState([])

  // Fetch user credits
  const fetchCredits = useCallback(async () => {
    if (!user) {
      setCredits(0)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Try to get credits from database
      const { data, error: fetchError } = await supabase
        .from('user_credits')
        .select('credits')
        .eq('user_id', user.id)
        .single()

      if (fetchError) {
        // If no record exists, initialize with 3 free credits
        if (fetchError.code === 'PGRST116') {
          const { data: newData, error: insertError } = await supabase
            .from('user_credits')
            .insert({ user_id: user.id, credits: 3, lifetime_credits: 3 })
            .select('credits')
            .single()

          if (insertError) {
            console.error('Error initializing credits:', insertError)
            // Fallback to 3 credits in UI
            setCredits(3)
          } else {
            setCredits(newData?.credits ?? 3)
          }
        } else {
          console.error('Error fetching credits:', fetchError)
          setError(fetchError.message)
          // Fallback to showing 3 credits
          setCredits(3)
        }
      } else {
        setCredits(data?.credits ?? 0)
      }
    } catch (err) {
      console.error('Credits fetch error:', err)
      setError(err.message)
      setCredits(3) // Fallback
    } finally {
      setLoading(false)
    }
  }, [user])

  // Fetch credits when user changes
  useEffect(() => {
    fetchCredits()
  }, [fetchCredits])

  // Use a credit for resume generation
  const useCredit = async (description = 'Resume generation') => {
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    if (credits < 1) {
      return { success: false, error: 'Insufficient credits' }
    }

    try {
      // Call the database function
      const { data, error: rpcError } = await supabase
        .rpc('use_credit', {
          p_user_id: user.id,
          p_description: description
        })

      if (rpcError) {
        // Fallback: manually deduct if RPC doesn't exist
        const { error: updateError } = await supabase
          .from('user_credits')
          .update({ credits: credits - 1 })
          .eq('user_id', user.id)

        if (updateError) {
          console.error('Error using credit:', updateError)
          return { success: false, error: updateError.message }
        }

        setCredits(prev => prev - 1)
        return { success: true, credits: credits - 1 }
      }

      if (data?.success) {
        setCredits(data.credits)
        return { success: true, credits: data.credits }
      } else {
        return { success: false, error: data?.error || 'Failed to use credit' }
      }
    } catch (err) {
      console.error('Use credit error:', err)
      return { success: false, error: err.message }
    }
  }

  // Add credits (for purchases or bonuses)
  const addCredits = async (amount, type = 'purchase', description = 'Credit purchase', metadata = {}) => {
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    try {
      // Call the database function
      const { data, error: rpcError } = await supabase
        .rpc('add_credits', {
          p_user_id: user.id,
          p_amount: amount,
          p_transaction_type: type,
          p_description: description,
          p_metadata: metadata
        })

      if (rpcError) {
        // Fallback: manually add if RPC doesn't exist
        const newBalance = credits + amount
        const { error: updateError } = await supabase
          .from('user_credits')
          .update({ credits: newBalance, lifetime_credits: newBalance })
          .eq('user_id', user.id)

        if (updateError) {
          console.error('Error adding credits:', updateError)
          return { success: false, error: updateError.message }
        }

        setCredits(newBalance)
        return { success: true, credits: newBalance }
      }

      if (data?.success) {
        setCredits(data.credits)
        return { success: true, credits: data.credits }
      } else {
        return { success: false, error: data?.error || 'Failed to add credits' }
      }
    } catch (err) {
      console.error('Add credits error:', err)
      return { success: false, error: err.message }
    }
  }

  // Fetch transaction history
  const fetchTransactions = async (limit = 20) => {
    if (!user) return []

    try {
      const { data, error: fetchError } = await supabase
        .from('credit_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (fetchError) {
        console.error('Error fetching transactions:', fetchError)
        return []
      }

      setTransactions(data || [])
      return data || []
    } catch (err) {
      console.error('Transactions fetch error:', err)
      return []
    }
  }

  // Check if user has enough credits
  const hasCredits = (required = 1) => {
    return credits >= required
  }

  // Refresh credits from database
  const refreshCredits = () => {
    fetchCredits()
  }

  const value = {
    credits,
    loading,
    error,
    transactions,
    useCredit,
    addCredits,
    fetchTransactions,
    hasCredits,
    refreshCredits
  }

  return (
    <CreditsContext.Provider value={value}>
      {children}
    </CreditsContext.Provider>
  )
}

export default CreditsContext
