import { supabase } from '../../config/supabase';
import type { PostgrestError } from '@supabase/supabase-js';

export interface ServiceResponse<T> {
  data: T | null;
  error: Error | null;
  loading?: boolean;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface SortParams {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FilterParams {
  [key: string]: any;
}

export type QueryParams = PaginationParams & SortParams & FilterParams;

export class ServiceError extends Error {
  code?: string;
  statusCode?: number;
  details?: any;
  
  constructor(message: string, code?: string, statusCode?: number, details?: any) {
    super(message);
    this.name = 'ServiceError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

export abstract class BaseService {
  protected tableName: string;
  
  constructor(tableName: string) {
    this.tableName = tableName;
  }
  
  // Error handling
  protected handleError(error: PostgrestError | Error | unknown): ServiceError {
    if (error instanceof ServiceError) {
      return error;
    }
    
    if (error && typeof error === 'object' && 'code' in error) {
      const pgError = error as PostgrestError;
      return new ServiceError(
        pgError.message || 'Database error occurred',
        pgError.code,
        undefined,
        pgError.details
      );
    }
    
    if (error instanceof Error) {
      return new ServiceError(error.message);
    }
    
    return new ServiceError('An unexpected error occurred');
  }
  
  // Response wrapper
  protected createResponse<T>(
    data: T | null,
    error?: Error | PostgrestError | null
  ): ServiceResponse<T> {
    if (error) {
      return {
        data: null,
        error: this.handleError(error),
      };
    }
    
    return {
      data,
      error: null,
    };
  }
  
  // Generic CRUD operations
  async findAll(params?: QueryParams): Promise<ServiceResponse<any[]>> {
    try {
      let query = supabase.from(this.tableName).select('*');
      
      // Apply filters
      if (params) {
        const { page, limit = 20, offset, sortBy, sortOrder = 'asc', ...filters } = params;
        
        // Pagination
        if (page !== undefined) {
          const calculatedOffset = (page - 1) * limit;
          query = query.range(calculatedOffset, calculatedOffset + limit - 1);
        } else if (offset !== undefined) {
          query = query.range(offset, offset + limit - 1);
        }
        
        // Sorting
        if (sortBy) {
          query = query.order(sortBy, { ascending: sortOrder === 'asc' });
        }
        
        // Filters
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            query = query.eq(key, value);
          }
        });
      }
      
      const { data, error } = await query;
      return this.createResponse(data, error);
    } catch (error) {
      return this.createResponse(null, error);
    }
  }
  
  async findById(id: string): Promise<ServiceResponse<any>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single();
      
      return this.createResponse(data, error);
    } catch (error) {
      return this.createResponse(null, error);
    }
  }
  
  async create(payload: any): Promise<ServiceResponse<any>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .insert(payload)
        .select()
        .single();
      
      return this.createResponse(data, error);
    } catch (error) {
      return this.createResponse(null, error);
    }
  }
  
  async update(id: string, payload: any): Promise<ServiceResponse<any>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .update(payload)
        .eq('id', id)
        .select()
        .single();
      
      return this.createResponse(data, error);
    } catch (error) {
      return this.createResponse(null, error);
    }
  }
  
  async delete(id: string): Promise<ServiceResponse<void>> {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('id', id);
      
      return this.createResponse(null, error);
    } catch (error) {
      return this.createResponse(null, error);
    }
  }
  
  // Batch operations
  async createMany(items: any[]): Promise<ServiceResponse<any[]>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .insert(items)
        .select();
      
      return this.createResponse(data, error);
    } catch (error) {
      return this.createResponse(null, error);
    }
  }
  
  async updateMany(updates: { id: string; data: any }[]): Promise<ServiceResponse<any[]>> {
    try {
      const promises = updates.map(({ id, data }) =>
        supabase
          .from(this.tableName)
          .update(data)
          .eq('id', id)
          .select()
          .single()
      );
      
      const results = await Promise.all(promises);
      const errors = results.filter(r => r.error).map(r => r.error);
      
      if (errors.length > 0) {
        return this.createResponse(null, errors[0]);
      }
      
      const data = results.map(r => r.data);
      return this.createResponse(data, null);
    } catch (error) {
      return this.createResponse(null, error);
    }
  }
  
  async deleteMany(ids: string[]): Promise<ServiceResponse<void>> {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .in('id', ids);
      
      return this.createResponse(null, error);
    } catch (error) {
      return this.createResponse(null, error);
    }
  }
  
  // Count records
  async count(filters?: FilterParams): Promise<ServiceResponse<number>> {
    try {
      let query = supabase
        .from(this.tableName)
        .select('*', { count: 'exact', head: true });
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            query = query.eq(key, value);
          }
        });
      }
      
      const { count, error } = await query;
      return this.createResponse(count, error);
    } catch (error) {
      return this.createResponse(null, error);
    }
  }
  
  // Check existence
  async exists(id: string): Promise<ServiceResponse<boolean>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('id')
        .eq('id', id)
        .single();
      
      if (error && error.code === 'PGRST116') {
        // No rows returned
        return this.createResponse(false, null);
      }
      
      return this.createResponse(!!data, error);
    } catch (error) {
      return this.createResponse(null, error);
    }
  }
}